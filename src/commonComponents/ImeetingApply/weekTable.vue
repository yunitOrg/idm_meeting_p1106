<template>
  <div class="weekTable" ref="weekTable" :style="`height:${setBoxHeight}`">
    <simplebarvue class="idm-meeting-room-card-wrapper">
      <!--色块-->
      <div class="idm-meeting-room-card-block-outer" v-if="Array.isArray(blockList) && blockList.length>0">
        <div v-for="(block, b) in blockList" :key="b" class="idm-meeting-room-card-block" :style="`top:${(block.roomIndex * 50)+100}px`" @click="handleDialog(block)">
          <span class="block-main" :style="`background-color:${block.color}`"></span>
        </div>
      </div>
      <!--表格-->
      <table ref="table" class="idm-meeting-room-card-table" border="1" cellspacing="0">
        <thead>
          <tr class="room-sticky" >
            <template v-if="isShowBuilding">
              <td ref="tableTdStyle" class="td-name" rowspan="2">会议室类型</td>
              <td ref="tableTdName" class="td-name" rowspan="2">会议室名称</td>
            </template>
            <template v-else>
              <td ref="tableTdName" class="td-name" rowspan="2">会议室名称</td>
            </template>
            <template v-if="Array.isArray(theadList) && theadList.length>0">
              <td class="td-time"  v-for="(td, t) in theadList" :key="t" :colspan="isWorkEndOver18? 3:2" :class="{
                'holiday': t>=5
              }">
                <div>星期{{ weekCn[t] }}</div>
                {{ td.day }}
              </td>
            </template>
          </tr>
          <tr class="room-sticky1" v-if="Array.isArray(theadList) && theadList.length>0">
            <template v-for="(td) in theadList">
              <td v-for="(noon, i) in td.noon" class="td-noon" :key="i+getUniqueId()">
                <img :src="hadnleforeNoon()" alt="" v-if="i==0">
                <img :src="hadnleafterNoon()" alt="" v-if="i==1">
                <img :src="hadnlPm2Noon()" alt="" v-if="i==2">
                {{ noon.value }}
              </td>
            </template>
          </tr>
        </thead>
        <tbody v-if="Array.isArray(roomList) && roomList.length">
          <tr v-for="(room, r) in roomList" :key="r"
            class="td-content"
            @mouseenter="handleTrMouseEnter"
            @mousedown="(e) => handleTrMouseDown(e, room)"
            @mousemove="handleTrMouseMove"
            @mouseup="handleTrMouseUp">
            <template v-if="isShowBuilding">
              <td class="td-room"><span>{{ room.roomClass }}</span></td>
              <td class="td-room"><span>{{ room.roomName }}</span></td>
            </template>
            <template v-else>
              <td class="td-room"><span>{{ room.roomClass }} {{ room.roomName }}</span></td>
            </template>
            <template v-for="(td, subindex) in theadTimeList">
              <td :key="subindex"
                :class="!showTips({end: td.end}) && 'cursor'"
                class="td-item"
                :start="td.start"
                :end="td.end"
                @click="handleClickTd(room, td)">
                <template v-if="showTips({end: td.end})">
                  <div class="td-tips">该时间段已过</div>
                </template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </simplebarvue>
    <div v-if="Array.isArray(legendList) && legendList.length>0" class="idm-meeting-room-card-legend" :style="`bottom:${propData.legendBottomDis}`">
      <div class="legend-item" v-for="(legend, l) in legendList" :key="l">
        <span
          class="legend-item-circle"
          :style="`background-color:${legend.color}`"
        ></span>
        <span class="legend-item-text">{{ legend.text }}</span>
      </div>
    </div>
    <a-modal
      title="请选择拟稿部门"
      :visible="visible"
      centered="true"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      cancelText="取消"
      okText="确定"
      @cancel="visible=false"
    >
      <a-radio-group v-model="orgId">
        <a-radio v-for="(radio, raindex) in radioAry" :key="raindex" :value="radio.id" style="display:block;height: 30px;">{{ radio.orgName }}</a-radio>
      </a-radio-group>
    </a-modal>
    <!--时间弹框-->
    <a-modal
      title="时间段"
      :width="timeVisible.width"
      class="weekdialog"
      :dialog-style="{ top: '30%' }"
      :visible="timeVisible.show"
      @cancel="timeVisible.show=false"
      :footer="null"
    >
      <table ref="dialogTable"  class="idm-meeting-room-card-table dialogtable" border="1" cellspacing="0">
        <thead>
          <tr class="table-time-bar">
            <template v-for="(td, t) in timeVisible.dialogThead">
              <td class="td-time"
                v-if="showTimeTd(td, t)"
                :colspan="td.colspan"
                :key="t">
                <span>{{ td.start }}</span>
              </td>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="(td, t) in timeVisible.dialogThead"
              :key="t"
              class="td-item"
            ></td>
          </tr>
        </tbody>
        <div v-for="(block, b) in timeVisible.disloagBlock" :key="b"
          class="idm-meeting-room-card-block"
          :style="{width: block.blockStyle?.width, top: block.blockStyle?.top, left: block.blockStyle?.left}"
           @click="handleOpenUrl(block)">
          <a-tooltip>
            <div class="idm-meeting-room-tooltip" slot="title">
              <template v-if="block.dataType == 2">
                <div v-html="handleColorTipsLockContent(block)"></div>
              </template>
              <template v-else>
                <div v-html="handleColorTipsContent(block)"></div>
              </template>
            </div>
            <span class="block-main" :style="`background-color:${block.color}`"></span>
          </a-tooltip>
        </div>
      </table>
    </a-modal>
  </div>
</template>

<script>
import simplebarvue from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import moment from "moment";
import ImeetingApply from '../../mixins/ImeetingApply';
import API from '../../api/meeting';
import { message } from 'ant-design-vue'
export default {
  components: {
    simplebarvue
  },
  props: {
    moduleObject: {
      type: Object
    },
    propData: {
      type: Object
    },
  },
  mixins: [ImeetingApply],
  data() {
    return {
      setBoxHeight: this.propData.meetingWeekHei,
      isShowBuilding: false,
      mouseupFlag: false,
      timeVisible: {
        show: false,
        width: '',
        // 表头
        dialogThead: [],
        // 色块
        disloagBlock: []
      },
      weekCn: ["一", "二", "三", "四", "五", "六", "日"],
      // 日期 开始时间
      startTime: '',
      // 日期 结束时间
      endTime: '',
      // 工作 开始时间
      workStar: '',
      // 工作 结束时间
      workEnd: '',
      //是否工作结束时间超过了18点
      isWorkEndOver18: false,
      // 会议室
      roomList: [],
      // 头部
      theadList: [],
      // 头部时间
      theadTimeList: [],
      // 色块
      blockList: [],
      // 图例
      legendList: [
        {
          color: "#cccccc",
          text: "占用",
          value: 3
        },
        {
          color: "#316EFE",
          text: "确认中",
          value: 1
        },
        {
          color: "#28CB7C",
          text: "已确认",
          value: 2
        },
        {
          color: "#f3efef",
          text: "空闲",
          value: 4
        },
        {
          color: "#FFBA00",
          text: "我参加",
          value: 5
        },
      ],
      noon: []
    }
  },
  methods: {
    //获取唯一值
     getUniqueId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    },
    // 时间弹框 表头
    handleDialoglogic(timeObj) {
      let start = moment(timeObj.start, "HH:mm");
      let end = moment(timeObj.end, "HH:mm");
      while (start.isBefore(end)) {
        this.timeVisible.dialogThead.push({
          year: timeObj.year,
          start: start.format('HH:mm'),
          end: moment(start)
            .add(30, "minute")
            .format("HH:mm"),
        });
        start = moment(start).add(30, "minute");
      }
      this.timeVisible.dialogThead.forEach((item, index) => {
        if (item.start.slice(3) === "00") {
          item.colspan = 2;
        }
      });
    },
    computedDialogColor({meetingStart, meetingEnd, clickYear}) {
      let count = 0, enterIndex = 0, bettwen = false;
      let targetAry = this.timeVisible.dialogThead
      let start = clickYear + " " + targetAry[0].start,
        end = clickYear + " " + targetAry[targetAry.length-1].end;
      if (meetingStart.isBefore(moment(start, "YYYY-MM-DD HH:mm")) && meetingEnd.isAfter(moment(end, "YYYY-MM-DD HH:mm"))) {
        count = targetAry.length;
        enterIndex = 0
      } else if (meetingStart.isBefore(start, "YYYY-MM-DD HH:mm") && meetingEnd.isBetween(moment(start, "YYYY-MM-DD HH:mm"), moment(end, "YYYY-MM-DD HH:mm"), null, '[]')) {
        enterIndex = 0
        targetAry.forEach((section, index) => {
          // 时间段开始时间
          const sectionStart = moment(
            clickYear + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            clickYear + " " + section.end,
            "YYYY-MM-DD HH:mm"
          );
          // 走出时间段
          if(meetingEnd.isAfter(sectionEnd) || meetingEnd.isSame(sectionEnd)) {
            count++;
          }
        })
      } else if (meetingEnd.isBefore(moment(start, "YYYY-MM-DD HH:mm")) || meetingStart.isAfter(moment(end, "YYYY-MM-DD HH:mm")) || meetingStart.isSame(moment(end, "YYYY-MM-DD HH:mm"))) {
        // 不处理
      } else if (meetingStart.isBetween(moment(start, "YYYY-MM-DD HH:mm"), moment(end, "YYYY-MM-DD HH:mm"), null, '[]') && meetingEnd.isAfter(moment(end, "YYYY-MM-DD HH:mm"))) {
        targetAry.forEach((section, index) => {
          //时间段开始时间
          const sectionStart = moment(
            clickYear + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            clickYear + " " + section.end,
            "YYYY-MM-DD HH:mm"
          );
          // 进入时间段
          if(meetingStart.isBetween(sectionStart, sectionEnd) ||  sectionStart.isSame(meetingStart) ) {
            enterIndex = index;
          }
        });
        count = targetAry.length - enterIndex
      } else {
        targetAry.forEach((section, index) => {
          //时间段开始时间
          const sectionStart = moment(
            clickYear + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            clickYear + " " + section.end,
            "YYYY-MM-DD HH:mm"
          );
          // 进入时间段
          if(meetingStart.isBetween(sectionStart, sectionEnd) || sectionStart.isSame(meetingStart)) {
            bettwen = true;
            enterIndex = index;
          }
          // 走出时间段
          if(meetingEnd.isBetween(sectionStart, sectionEnd) || sectionEnd.isSame(meetingEnd)) {
            count++;
            bettwen = false;
          }
          // 在时间段之前计数
          if (bettwen) count++;
        });
      }
      return {
        count: count,
        enterIndex: enterIndex
      }
    },
    // 计算弹框色块
    handleDialogColorBlock(meetingAll, clickYear) {
      if (meetingAll && meetingAll.length > 0) {
        meetingAll.forEach(meeting => {
          let meetingStart = meeting.satrtTime;
          meetingStart = moment(meetingStart, "YYYY-MM-DD HH:mm"); //会议开始时间
          let meetingEnd = meeting.endTime;
          meetingEnd = moment(meetingEnd, "YYYY-MM-DD HH:mm"); //会议结束时间
          let { count, enterIndex } = this.computedDialogColor({meetingStart, meetingEnd, clickYear: clickYear})
          meeting.count = count; // 计算占用多少格
          meeting.roomIndex = 1; // 计算定位top
          meeting.enterIndex = enterIndex; // 计算定位left
          this.hanldeColorBlock(meeting)
          this.timeVisible.disloagBlock.push(meeting);
        })
        this.timeVisible.disloagBlock = this.timeVisible.disloagBlock.filter(k => k.count > 0);
        let tdwidth = 60;
        this.timeVisible.disloagBlock.forEach(block => {
          block.blockStyle = {
            width: tdwidth * block.count + "px",
            top: '50px',
            left: tdwidth * block.enterIndex + "px"
          }
        })
      }
    },
    handleDialog(item) {
      this.timeVisible.dialogThead = [];
      this.timeVisible.disloagBlock = [];
      let start = item.section.start?.split(' '),
        end = item.section.end?.split(' ')[1];
      // 计算表头
      this.handleDialoglogic({year: start[0], start: start[1], end: end})
      // 设置弹框宽度
      this.timeVisible.width = this.timeVisible.dialogThead.length * 60 + 50 + 'px'
      // 找到对应 会议室数据
      let meetingRoomUsageData = this.roomList.find(k => k.roomId == item.roomId).meetingRoomUsageData;
      // 计算色块
      this.handleDialogColorBlock(meetingRoomUsageData, start[0])
      this.timeVisible.show = true
    },
    showTimeTd(td, index) {
      const m = td.start.slice(3);
      if (m === "00") {
        return true;
      }
      if (m === "30" && (index === 0 || index === this.timeVisible.dialogThead.length)) {
        return true;
      }
    },
    hadnleforeNoon() {
      return IDM.url.getModuleAssetsWebPath(require('../../assets/am.jpg'), this.moduleObject)
    },
    hadnleafterNoon() {
      return IDM.url.getModuleAssetsWebPath(require('../../assets/pm.jpg'), this.moduleObject)
    },
    hadnlPm2Noon() {
      return IDM.url.getModuleAssetsWebPath(require('../../assets/pm2.png'), this.moduleObject)
    },
    handleOk() {
      this.confirmLoading = true;
      let { room, td } = this.jumpParams
      let moduleId  = '190111184257QgSNR8cW92akDpqeWMA';
      if(IDM.url.queryString("type")=="hysyd"){
        moduleId = "1905311647221BSf1doWPYLsr8nAdqB";
      }
      try{
        let start = td.start;
        let end = td.end;
        let url = window.IDM.url.getURLRoot() + "ctrl/formControl/form?moduleId="+moduleId+"&startTime=" + start+"&endTime="+end+"&roomId="+room.roomId+"&roomName="+encodeURI(room.roomName);
        if (this.orgId) {
          url += "&draftOrgId=" + this.orgId;
        }
        setTimeout(() => {
          this.visible = false;
          this.confirmLoading = false;
        }, 200);
        window.open(url)
      } catch(e) {}
    },
    // 色块跳转
    handleOpenUrl(item) {
      this.$emit('colorJumpUrl', item)
    },
    // 点击跳转
    handleIsClick(start) {
      return moment(start).isBefore(moment().format("YYYY-MM-DD HH:mm"))
    },
    // handleOpenPage(block) {
    //   let room = {
    //     roomId: block.roomId,
    //     roomName: block.roomName
    //   }
    //   let td = {
    //     start: block.satrtTime,
    //     end: block.endTime
    //   }
    //   this.handleClickTd(room, td, true)
    // },
    // 点击td
    async handleClickTd(room, td, flag) {
      if (this.mouseupFlag) {
        return
      }
      try{
        if (!flag) {
          if (this.showTips({end: td.end})) return

          if (this.handleIsClick(td.start)) {
            message.config({
              duration: 1,
              top: '50%'
            })
            message.error("不能预定当前时间以前的会议!")
            return
          }
        }

        this.jumpParams = {}
        this.orgId = ''
        let moduleId  = '190111184257QgSNR8cW92akDpqeWMA';
        if(IDM.url.queryString("type")=="hysyd"){
          moduleId = "1905311647221BSf1doWPYLsr8nAdqB";
        }
        let res = await API.ApiMeetingAllDept({moduleId: moduleId})
        if (res.code == '200') {
          let data = res.data || []
          if (data && data.length > 1) {
            this.radioAry = data;
            this.orgId = data[0].id
            this.jumpParams = {room, td}
            this.visible = true
          } else {
            let start = td.start;
            let end = td.end;
            const url = window.IDM.url.getURLRoot() + "ctrl/formControl/form?moduleId="+moduleId+"&startTime=" + start+"&endTime="+end+"&roomId="+room.roomId+"&roomName="+encodeURI(room.roomName);
            window.open(url)
          }
        } else {
          let start = td.start;
          let end = td.end;
          const url = window.IDM.url.getURLRoot() + "ctrl/formControl/form?moduleId="+moduleId+"&startTime=" + start+"&endTime="+end+"&roomId="+room.roomId+"&roomName="+encodeURI(room.roomName);
          window.open(url)
        }
      } catch(e) {
        console.log(e)
      }
    },
    async handleClickTdMouse(room, td, flag) {
      try{
        if (!flag) {
          if (this.showTips({end: td.end})) return

          if (this.handleIsClick(td.start)) {
            message.config({
              duration: 1,
              top: '50%'
            })
            message.error("不能预定当前时间以前的会议!")
            return
          }
        }

        this.jumpParams = {}
        this.orgId = ''
        let moduleId  = '190111184257QgSNR8cW92akDpqeWMA';
        if(IDM.url.queryString("type")=="hysyd"){
          moduleId = "1905311647221BSf1doWPYLsr8nAdqB";
        }
        let res = await API.ApiMeetingAllDept({moduleId: moduleId})
        if (res.code == '200') {
          let data = res.data || []
          if (data && data.length > 1) {
            this.radioAry = data;
            this.orgId = data[0].id
            this.jumpParams = {room, td}
            this.visible = true
          } else {
            let start = td.start;
            let end = td.end;
            const url = window.IDM.url.getURLRoot() + "ctrl/formControl/form?moduleId="+moduleId+"&startTime=" + start+"&endTime="+end+"&roomId="+room.roomId+"&roomName="+encodeURI(room.roomName);
            window.open(url)
          }
        } else {
          let start = td.start;
          let end = td.end;
          const url = window.IDM.url.getURLRoot() + "ctrl/formControl/form?moduleId="+moduleId+"&startTime=" + start+"&endTime="+end+"&roomId="+room.roomId+"&roomName="+encodeURI(room.roomName);
          window.open(url)
        }
      } catch(e) {
        console.log(e)
      }
    },
    // 判断时间段是否已过
    showTips(obj) {
      let { start, end } = obj
      return moment(end).isBefore(moment().format("YYYY-MM-DD HH:mm"))
    },
    handleDomHeight({height}) {
      let span = document.createElement('span')
      let result = {}
      result.width = span.offsetWidth;
      result.height = span.offsetHeight;
      span.style.display = 'inline-block';
      span.style.visibility = 'hidden';
      span.style.height = height
      document.body.appendChild(span)
      result.width = span.offsetWidth
      result.height = span.offsetHeight;
      span.parentNode?.removeChild(span)
      return result
    },
    initTable(weekListTable) {
      console.log(weekListTable);
      this.isWorkEndOver18 = false;
      this.setBoxHeight = this.propData.meetingWeekHei;
      this.roomList = [];
      this.theadList = [];
      this.noon = [];
      this.theadTimeList = [];
      this.blockList = [];
      this.isShowBuilding = weekListTable.isShowBuilding;
      this.roomList = weekListTable.room;
      this.startTime = weekListTable.showStartDate
      this.endTime = weekListTable.showEndDate
      this.workStar = weekListTable.workingStartTime
      this.workEnd = weekListTable.offDutyEndTime
      // 初始化表头
      this.initThead()
      // 计算色块
      this.initRoom()
      let tableHeight = this.handleDomHeight({height: this.propData.meetingWeekHei});
      this.$nextTick(() => {
        let td = this.$refs.table?.querySelector('.td-room')
        let theadtd = this.$refs.table?.querySelector('.td-name')
        let realTableHeight = (this.roomList.length) * td.offsetHeight
        if (realTableHeight <= tableHeight.height) {
          // let dom = this.$refs.weekTable;
          // dom.style.height = `${realTableHeight}px`
          this.setBoxHeight = `${realTableHeight+theadtd.offsetHeight}px`
        } else {
          this.setBoxHeight = this.propData.meetingWeekHei;
          // let dom = this.$refs.weekTable;
          // dom.style.height = this.propData.meetingWeekHei;
        }
      })
      // 渲染色块
      this.initBlock()
    },
    // 计算表头数据
    handleTheadData() {
      let that = this;
      let start =  moment(this.startTime, "YYYY-MM-DD");
      let end = moment(that.endTime, "YYYY-MM-DD");
      if (start.isBefore(end) || start.isSame(end)) {
        while (start.isBefore(end) || start.isSame(end)) {
          that.noon.forEach((item, index) => {
              if (index == 0) {
                this.theadTimeList.push({
                  start: start.format('YYYY-MM-DD') + " " + this.workStar,
                  end: start.format('YYYY-MM-DD') + " " + '13:00'
                })
              } else {
                if(this.isWorkEndOver18==false){
                  this.theadTimeList.push({
                    start: start.format('YYYY-MM-DD') + " " + '13:00',
                    end: start.format('YYYY-MM-DD') + " " + this.workEnd
                  })
                  
                }else{
                  if(index==1){
                    this.theadTimeList.push({
                      start: start.format('YYYY-MM-DD') + " " + '13:00',
                      end: start.format('YYYY-MM-DD') + " " + this.propData.WeekNightTime
                    })
                  }
                  if(index==2){
                    this.theadTimeList.push({
                      start: start.format('YYYY-MM-DD') + " " + this.propData.WeekNightTime,
                      end: start.format('YYYY-MM-DD') + " " + this.workEnd
                    })
                  }
                }
                
              }
          })
          start = moment(start).add(1, 'days')
        }
      } else {
        for(let i=1; i<=7; i++) {
          that.noon.forEach((item, index) => {
              if (index == 0) {
                this.theadTimeList.push({
                  start: start.format('YYYY-MM-DD') + " " + this.workStar,
                  end: start.format('YYYY-MM-DD') + " " + '13:00'
                })
              } else {
                if(this.isWorkEndOver18==false){
                  this.theadTimeList.push({
                    start: start.format('YYYY-MM-DD') + " " + '13:00',
                    end: start.format('YYYY-MM-DD') + " " + this.workEnd
                  })
                  
                }else{
                  if(index==1){
                    this.theadTimeList.push({
                      start: start.format('YYYY-MM-DD') + " " + '13:00',
                      end: start.format('YYYY-MM-DD') + " " + this.propData.WeekNightTime
                    })
                  }
                  if(index==2){
                    this.theadTimeList.push({
                      start: start.format('YYYY-MM-DD') + " " + this.propData.WeekNightTime,
                      end: start.format('YYYY-MM-DD') + " " + this.workEnd
                    })
                  }
                }
              }
          })
          start = moment(start).add(1, 'days')
        }
      }
      console.log(this.theadTimeList, this.theadList,"表头数据");
    },
    // 初始化表头
    initThead() {
      let start =  moment(this.startTime, "YYYY-MM-DD");
      let end = moment(this.endTime, "YYYY-MM-DD");
      //判断this.workEnd是否在18点以后，则分为上午、下午、晚上三个时间段，否则分为上午、晚上两个时间段。
      if (moment(this.workEnd, "HH:mm").isAfter(moment(this.propData.WeekNightTime, "HH:mm"))==false) {
        this.isWorkEndOver18=false
          this.noon = [
              {time: `${this.workStar}-13:00`, value: '上午'},
              {time: `13:00-${this.workEnd}`, value: '下午'}
          ]
      } else {
        this.isWorkEndOver18=true
          this.noon = [
            {time: `${this.workStar}-13:00`, value: '上午'},
            {time: `13:00-${this.propData.WeekNightTime}`, value: '下午'},
            {time: `${this.propData.WeekNightTime}-${this.workEnd}`, value: '晚上'}
          ]
      }

      // this.noon = [
      //     {time: `${this.workStar}-13:00`, value: '上午'},
      //     {time: `13:00-${this.workEnd}`, value: '下午'}
      // ]
      if (start.isBefore(end) || start.isSame(end)) {
        while (start.isBefore(end) || start.isSame(end)) {
          this.theadList.push({
            day: start.format('YYYY-MM-DD'),
            noon: this.noon
          })
          start = moment(start).add(1, 'days')
        }
        this.handleTheadData()
      } else {
        for(let i=1; i<=7; i++) {
          this.theadList.push({
            day: start.format('YYYY-MM-DD'),
            noon: this.noon
          })
          start = moment(start).add(1, 'days')
        }
        this.handleTheadData()
      }
    },
    // 计算颜色
    hanldeColorBlock(meeting) {
      if (meeting.isAttend && meeting.isAttend == 1) { // 已参会
        meeting.color = this.legendList.find(k => k.value == 5)?.color
      } else {
        meeting.color = this.legendList.find(k => k.value == meeting.status)?.color
      }
    },
    // 计算会议室占用时间
    computedRoomTime(meeting, ri, roomId) {
      let meetingStart = meeting.satrtTime;
      meetingStart = moment(meetingStart, "YYYY-MM-DD HH:mm"); //会议开始时间
      let meetingEnd = meeting.endTime;
      meetingEnd = moment(meetingEnd, "YYYY-MM-DD HH:mm"); //会议结束时间

      // let count = 0, enterIndex = 0, bettwen = false;
      // let timestart = this.theadTimeList[0]
      // let timeend = this.theadTimeList[this.theadTimeList.length-1]
      // let start = this.theadTimeList[0].start
      // let end = this.theadTimeList[this.theadTimeList.length-1].end;

      // if (meetingStart.isBefore(moment(start, "YYYY-MM-DD HH:mm")) && meetingEnd.isAfter(moment(end, "YYYY-MM-DD HH:mm"))) {
      //   this.theadTimeList.forEach((item, i) => {
      //     meeting.count = 1 // 计算占用多少格
      //     meeting.roomIndex = ri // 计算定位top
      //     meeting.enterIndex = i // 计算定位left
      //     this.hanldeColorBlock(meeting)
      //     this.blockList.push(meeting);
      //   })
      // } else if (meetingStart.isBefore(moment(start, "YYYY-MM-DD HH:mm")) && meetingEnd.isBetween(moment(start, "YYYY-MM-DD HH:mm"), moment(end, "YYYY-MM-DD HH:mm"), null, '[]')) {
      //   this.theadTimeList.forEach((section, i) => {
      //     // 时间段开始时间
      //     const sectionStart = moment(
      //       section.start,
      //       "YYYY-MM-DD HH:mm"
      //     );
      //     // 时间段结束数据
      //     const sectionEnd = moment(
      //       section.end,
      //       "YYYY-MM-DD HH:mm"
      //     );
      //     let obj = Object.assign({}, meeting, { count: 1, roomIndex: ri, enterIndex: i })
      //     this.hanldeColorBlock(obj)
      //     // 时间段内
      //     if(meetingEnd.isAfter(sectionStart) || meetingEnd.isSame(sectionEnd)) {
      //       this.blockList.push(obj);
      //     }
      //   })
      // } else if (meetingEnd.isBefore(moment(start, "YYYY-MM-DD HH:mm"))) {
      //   // 不处理
      // } else if (meetingStart.isBetween(moment(start, "YYYY-MM-DD HH:mm"), moment(end, "YYYY-MM-DD HH:mm"), null, '[]') && meetingEnd.isAfter(moment(end, "YYYY-MM-DD HH:mm"))) {
      //   this.theadList.forEach((section, i) => {
      //     //时间段开始时间
      //     const sectionStart = moment(
      //       section.start,
      //       "YYYY-MM-DD HH:mm"
      //     );
      //     // 时间段结束数据
      //     const sectionEnd = moment(
      //       section.end,
      //       "YYYY-MM-DD HH:mm"
      //     );
      //     // 进入时间段
      //     if(meetingStart.isBetween(sectionStart, sectionEnd) ||  sectionStart.isSame(meetingStart) ) {
      //       let obj = Object.assign({}, meeting, { count: 1, roomIndex: ri, enterIndex: i })
      //       this.hanldeColorBlock(obj)
      //       this.blockList.push(obj);
      //     }
      //   });
      // } else {
        this.theadTimeList.forEach((section, i) => {
          //时间段开始时间
          const sectionStart = moment(
            section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            section.end,
            "YYYY-MM-DD HH:mm"
          );
          const addfunc = (meeting, params) =>  {
            let obj = Object.assign({}, meeting, params)
            this.hanldeColorBlock(obj)
            this.blockList.push(obj);
          }
          // sectionStart.isBetween(meetingStart, meetingEnd, null, '[') || (sectionStart.isBefore(meetingStart) && sectionEnd.isAfter(meetingEnd))
          // , meeting.room)
          if ((sectionStart.isBetween(meetingStart, meetingEnd) || sectionStart.isSame(meetingStart))
            || (sectionStart.isBefore(meetingStart) && sectionEnd.isAfter(meetingEnd))
            || (sectionStart.isBefore(meetingStart) && sectionEnd.isSame(meetingEnd))
            || (sectionStart.isBefore(meetingStart) && sectionEnd.isBetween(meetingStart, meetingEnd))) {
            addfunc(meeting, { count: 1, roomIndex: ri, enterIndex: i, section: section, roomId: roomId })
          }
          // 进入时间段
          // if (meetingStart.isBefore(sectionStart) && meetingEnd.isAfter(sectionEnd)) {
          //   addfunc(meeting, { count: 1, roomIndex: ri, enterIndex: i })
          // } else if (meetingStart.isBefore(sectionStart) && meetingEnd.isBetween(sectionStart, sectionEnd)) {
          //   addfunc(meeting, { count: 1, roomIndex: ri, enterIndex: i })
          // } else if (meetingEnd.isBefore(sectionStart)) {
          //   // 不处理
          // } else if (meetingStart.isBetween(sectionStart, sectionEnd, null, '[]') || ) {
          //   addfunc(meeting, { count: 1, roomIndex: ri, enterIndex: i })
          // } else {
          //   // addfunc(meeting, { count: 1, roomIndex: ri, enterIndex: i })
          // }
          // 走出时间段
          // if(meetingEnd.isBetween(sectionStart, sectionEnd) || sectionEnd.isSame(sectionStart)) {
          //   bettwen = false;
          // }
          // // 在时间段之前计数
          // if (bettwen){
          //   let obj = Object.assign({}, meeting, { count: 1, roomIndex: ri, enterIndex: enterIndex })
          //   this.hanldeColorBlock(obj)
          //   this.blockList.push(obj);
          // }
        });
      // }
    },
    // 初始化会议室
    initRoom() {

      if (this.roomList && this.roomList.length > 0) {
        this.roomList.forEach((room, ri) => {
          if(room.meetingRoomUsageData && room.meetingRoomUsageData.length > 0) {
            room.meetingRoomUsageData.forEach(meeting => {
              meeting.room = `${room.roomClass}${room.roomName}`
              meeting.roomId = room.roomId;
              meeting.roomName = room.roomName;
              this.computedRoomTime(meeting, ri, room.roomId)
            })
          }
        });
        this.blockList = this.blockList.filter(k => k.count > 0);
      }
    },
    // 渲染色块
    initBlock() {
      this.$nextTick(() => {
        const tableEle = this.$refs.table;
        let sum = 0;
        if (this.isShowBuilding) {
          const tableTdStyle = this.$refs.tableTdStyle?.offsetWidth;
          const firstTdWidth = this.$refs.tableTdName?.offsetWidth;
          sum = tableTdStyle + firstTdWidth
        } else {
          sum = this.$refs.tableTdName?.offsetWidth;
        }
        const tdWidth = tableEle.offsetWidth - sum;
        const sectionWidth = tdWidth / this.theadTimeList.length;
        this.blockList.forEach((block, index) => {
          const styleObject = {};
          styleObject["left"] = sum + sectionWidth * block.enterIndex + "px";
          styleObject["width"] = sectionWidth * block.count + "px";
          window.IDM.setStyleToPageHead(
            this.moduleObject.id +
              " .weekTable .idm-meeting-room-card-block-outer .idm-meeting-room-card-block:nth-child(" +
              (index + 1) +
              ")",
            styleObject
          );
        })
      })
    }
  }
}
</script>

<style>
.idm-meeting-room-tooltip p{
  margin: 0;
  padding: 0;
}
.idm-meeting-room-tooltip p+p{
  padding-top: 5px;
}
</style>

<style lang="scss" scoped>
.weekdialog{
  table{
    position: relative;
  }
  .idm-meeting-room-card-table{
    // width: 100%;
    height: 100%;
    border: 0;
    border-collapse: collapse;
    table-layout: fixed;
    .td-time{
      background-color: #f9fcfe;
    }
    td{
      height: 50px;
      text-align: center;
      width: 60px;
      overflow: hidden;
      box-sizing: border-box;
      text-overflow: ellipsis;
      white-space: nowrap;
      border: 1px solid #ddd;
      font-weight: 500;
      color: #333;
    }
  }
  .idm-meeting-room-card-block{
    position: absolute;
    left: 0;
    height: 50px;
    width: 54px;
    z-index: 1;
    padding: 4px 4px;
    box-sizing: border-box;
    cursor: pointer;
    .block-main {
      padding: 0 8px;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
  }
}
.weekTable{
  color: #333;
  font-size: 16px;
  height: calc(100vh - 200px);
  .cursor{
    cursor: pointer;
  }
  .holiday {
    color: #EC4519 !important;
  }
  .idm-meeting-room-card-wrapper{
    width: 100%;
    max-height: 100%;
    height: 100%;
    border: 1px solid #ddd;
    position: relative;
    ::v-deep .simplebar-scrollbar:before {
      background-color: #e8e8e8;
    }
  }
  .idm-meeting-room-card-block-outer{
    position: relative;
    .idm-meeting-room-card-block{
      position: absolute;
      left: 0;
      height: 50px;
      width: 54px;
      z-index: 1;
      padding: 4px 4px;
      box-sizing: border-box;
      cursor: pointer;
      .block-main {
        padding: 0 8px;
        font-size: 14px;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        border-radius: 8px;
      }
    }
  }
  .idm-meeting-room-card-table{
    width: 100%;
    height: 100%;
    border-collapse: unset;
    border: 0;
    table-layout: fixed;
    .room-sticky{
      position: sticky;
      left: 0;
      top: 0;
      z-index: 3;
    }
    .room-sticky1{
      position: sticky;
      left: 0;
      top: 50px;
      z-index: 3;
    }
    tbody{
      border-right: 1px solid transparent;
      tr:first-child td {
        border-top-color: transparent;
      }
      tr:last-child td {
        border-bottom-color: transparent;
      }
      tr td:first-child {
        border-left-color: transparent;
        // border-right-color: transparent;
      }
      tr td:last-child {
        border-right-color: transparent;
      }
    }
    .td-time{
      position: sticky;
      left: 0;
      top: 0;
      z-index: 3;
      border-top-color: transparent;
    }
    .td-time:last-child{
      border-right-color: transparent;
    }
    .td-noon:last-child{
      border-right-color: transparent;
    }
    .td-name{
      border-left-color: transparent;
      border-top-color: transparent;
    }
    .td-name, .td-time, .td-noon{
      background-color: #f9fcfe;
    }
    td{
      height: 50px;
      text-align: center;
      width: 90px;
      border: 1px solid #ddd;
      border-top-color: transparent;
      border-left-color: transparent;
      font-weight: 500;
      color: #333;
    }
    .mouse{
      background-color: #4ea6e0;
    }
    .td-content td{
      height: 50px;
    }
    .td-noon img{
      width: 15px;
      height: 15px;
      margin-right: 5px;
    }
    .td-room{
      user-select: none;
      pointer-events: none;
      background-color: #f9fcfe;
    }
    .td-item{
      position: relative;
      &:hover{
        .td-tips{
          display: block;
        }
      }
    }
    .td-tips{
      user-select: none;
      padding: 10px;
      position: absolute;
      transform: translateY(-43px);
      top: 0;
      left: 0;
      width: 117px;
      height: 52px;
      z-index: 10;
      display: none;
      background: url('../../assets//tanchuan1.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      color: #fff;
      font-size: 14px;
      line-height: 32px;
      letter-spacing: 0;
    }
  }
  .idm-meeting-room-card-legend{
    display: flex;
    padding: 10px 0 0;
    justify-content: center;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 5px;
    font-size: 16px;
    .legend-item{
      margin-right: 20px;
      &:last-child {
        margin-right: 0;
      }
      .legend-item-circle {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #ccc;
        margin-right: 10px;
      }
    }
  }
}
</style>
