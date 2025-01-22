<template>
  <div class="roomtable" ref="roomtable" :style="`height:${setBoxHeight}`">
    <simplebarvue class="idm-meeting-room-card-wrapper">
        <!--色块-->
        <div class="idm-meeting-room-card-block-outer">
          <div v-for="(block, b) in blockList" :key="b" class="idm-meeting-room-card-block" @click="handleOpenUrl(block)">
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
        </div>
        <!--表格-->
        <table ref="table" class="idm-meeting-room-card-table" border="1" cellspacing="0">
          <thead>
              <tr class="table-time-bar">
                <template v-if="isShowBuilding">
                    <td ref="tableTdStyle" class="td-namesignle"><span>会议室类型</span></td>
                    <td ref="tableTdName" class="td-namesignle tdsignleleft"><span>会议室名称</span></td>
                </template>
                <template v-else>
                  <td ref="tableTdName" class="td-name"><span>会议室名称</span></td>
                </template>
                <td class="td-time" :key="t" v-for="(td, t) in theadList">
                  <span>{{ showTimeTd(td) }}</span>
                </td>
              </tr>
            </thead>
          <tbody>
            <tr
              v-for="(room, r) in roomList"
              :key="r"
              @mouseenter="handleTrMouseEnter"
              @mousedown="(e) => handleTrMouseDown(e, room)"
              @mousemove="handleTrMouseMove"
              @mouseup="handleTrMouseUp">
              <template v-if="isShowBuilding">
                <td class="td-room"><span :title="room.roomClass">{{ room.roomClass }}</span></td>
                <td class="td-room tdroomflex"><span :title="room.roomName">{{ room.roomName }}</span></td>
              </template>
              <template v-else>
                <td class="td-room"><span :title="`${room.roomClass} ${room.roomName}`">{{ room.roomClass }} {{ room.roomName }}</span></td>
              </template>
              <td v-for="(td, t) in theadList"
                :key="t"
                class="td-item"
                :class="!showTips({start: `${today} ${td.start}`}) && 'cursor'"
                @click="handleClickTd(room, {start: `${today} ${td.start}`, end: `${today} ${td.end}`})"
                :start="`${today} ${td.start}`"
                :end="`${today} ${td.end}`">
                <template v-if="showTips({start: `${today} ${td.start}`})">
                  <div class="td-tips">该时间段已过</div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
    </simplebarvue>
    <div class="idm-meeting-room-card-legend" :style="`bottom:${propData.legendBottomDis}`">
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
  </div>
</template>

<script>
import simplebarvue from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import "simplebar-vue/dist/simplebar-vue.js";
import moment from "moment";
import ImeetingApply from '../../mixins/ImeetingApply';
import API from '../../api/meeting';
export default {
  props: {
    tableData: {
      type: Object
    },
    propData: {
      type: Object
    },
    moduleObject: {
      type: Object
    }
  },
  mixins: [ImeetingApply],
  components: {
    simplebarvue
  },
  data() {
    return {
      setBoxHeight: this.propData.meetingDayHei,
      today: moment().format("YYYY-MM-DD"),
      hourday: moment().format("HH:mm"),
      isShowBuilding: false,
      startTime: '',
      mouseupFlag: false,
      endTime: '',
      room: [],
      // 会议室
      roomList: [],
      // 头部
      theadList: [],
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
      ]
    }
  },
  methods: {
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
        this.claerMouseClass()
        window.open(url)
      } catch(e) {}
    },
    // 色块跳转
    handleOpenUrl(item) {
      this.$emit('colorJumpUrl', item)
    },
    // 点击td
    async handleClickTd(room, td) {
      if (this.mouseupFlag) {
        return
      }
      try{
        if (this.showTips({start: td.start})) return

        let moduleId  = '190111184257QgSNR8cW92akDpqeWMA';
        if(IDM.url.queryString("type")=="hysyd"){
          moduleId = "1905311647221BSf1doWPYLsr8nAdqB";
        }
        this.jumpParams = {}
        this.orgId = ''
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
            this.claerMouseClass()
            window.open(url)
          }
        } else {
          let start = td.start;
          let end = td.end;
          const url = window.IDM.url.getURLRoot() + "ctrl/formControl/form?moduleId="+moduleId+"&startTime=" + start+"&endTime="+end+"&roomId="+room.roomId+"&roomName="+encodeURI(room.roomName);
          this.claerMouseClass()
           window.open(url)
        }
      } catch(e) {
        console.log(e)
      }
    },
    // 点击td
    async handleClickTdMouse(room, td) {
      try{
        if (this.showTips({start: td.start})) return

        let moduleId  = '190111184257QgSNR8cW92akDpqeWMA';
        if(IDM.url.queryString("type")=="hysyd"){
          moduleId = "1905311647221BSf1doWPYLsr8nAdqB";
        }
        this.jumpParams = {}
        this.orgId = ''
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
            this.claerMouseClass()
            window.open(url)
          }
        } else {
          let start = td.start;
          let end = td.end;
          const url = window.IDM.url.getURLRoot() + "ctrl/formControl/form?moduleId="+moduleId+"&startTime=" + start+"&endTime="+end+"&roomId="+room.roomId+"&roomName="+encodeURI(room.roomName);
          this.claerMouseClass()
          window.open(url)
        }
      } catch(e) {
        console.log(e)
      }
    },
    // 判断时间段是否已过
    showTips(obj) {
      let { start, end } = obj
      return moment(start).isBefore(moment().format("YYYY-MM-DD HH:mm"))
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
    // 初始化
    initTable(data) {
      this.setBoxHeight = this.propData.meetingDayHei;
      this.roomList = []
      this.theadList = []
      this.blockList = []
      // 是否分楼栋显示   true：显示  false：不显示
      this.isShowBuilding = data.isShowBuilding;
      this.startTime = data.workingStartTime
      this.endTime = data.offDutyEndTime
      this.today = data.currentDay
      this.room = data.room
      // 初始化 表头
      this.startTime && this.endTime && this.initThead()
      // 初始化会议室 计算色块
      this.theadList.length > 0 && this.initRoom()
      let tableHeight = this.handleDomHeight({height: this.propData.meetingDayHei});
      let td = this.$refs.table?.querySelector('td')
      let realTableHeight = (this.roomList.length + 1) * td.offsetHeight
      if (realTableHeight <= tableHeight.height) {
        // let dom = this.$refs.roomtable;
        // dom.style.height = `${realTableHeight}px`
        this.setBoxHeight = `${realTableHeight}px`
      } else {
        this.setBoxHeight = this.propData.meetingDayHei;
        // let dom = this.$refs.roomtable;
        // dom.style.height = this.propData.meetingDayHei;
      }
      // 渲染色块
      this.blockList.length > 0 && this.initBlock();
    },
    // 初始化表头
    initThead() {
      let start = moment(this.startTime, "HH:mm");
      let end = moment(this.endTime, "HH:mm");
      while (start.isBefore(end)) {
        this.theadList.push({
          start: start.format('HH:mm'),
          end: moment(start)
            .add(30, "minute")
            .format("HH:mm"),
        });
        start = moment(start).add(30, "minute");
      }
    },
    // 计算会议室占用时间
    computedRoomTime({meetingStart, meetingEnd}) {
      let count = 0, enterIndex = 0, bettwen = false;
      let start = this.today + " " + this.theadList[0].start,
        end = this.today + " " + this.theadList[this.theadList.length-1].end;
      if (meetingStart.isBefore(moment(start, "YYYY-MM-DD HH:mm")) && meetingEnd.isAfter(moment(end, "YYYY-MM-DD HH:mm"))) {
        count = this.theadList.length;
        enterIndex = 0
      } else if (meetingStart.isBefore(start, "YYYY-MM-DD HH:mm") && meetingEnd.isBetween(moment(start, "YYYY-MM-DD HH:mm"), moment(end, "YYYY-MM-DD HH:mm"), null, '[]')) {
        enterIndex = 0
        this.theadList.forEach((section, index) => {
          // 时间段开始时间
          const sectionStart = moment(
            this.today + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            this.today + " " + section.end,
            "YYYY-MM-DD HH:mm"
          );
          // 走出时间段
          if(meetingEnd.isAfter(sectionEnd) || meetingEnd.isSame(sectionEnd)) {
            count++;
          }
        })
      } else if (meetingEnd.isBefore(moment(start, "YYYY-MM-DD HH:mm"))) {
        // 不处理
      } else if (meetingStart.isBetween(moment(start, "YYYY-MM-DD HH:mm"), moment(end, "YYYY-MM-DD HH:mm")) && meetingEnd.isAfter(moment(end, "YYYY-MM-DD HH:mm"))) {
        this.theadList.forEach((section, index) => {
          //时间段开始时间
          const sectionStart = moment(
            this.today + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            this.today + " " + section.end,
            "YYYY-MM-DD HH:mm"
          );
          // 进入时间段
          if(meetingStart.isBetween(sectionStart, sectionEnd) ||  sectionStart.isSame(meetingStart) ) {
            enterIndex = index;
          }
        });
        count = this.theadList.length - enterIndex
      } else {
        this.theadList.forEach((section, index) => {
          //时间段开始时间
          const sectionStart = moment(
            this.today + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            this.today + " " + section.end,
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
    // 初始化会议室
    initRoom() {
      if (this.room && this.room.length > 0) {
        this.roomList = this.room;
        // 色块
        this.blockList = []
        this.roomList.forEach((room, ri) => {
          room.roomName = room.roomName && room.roomName.slice(0, 6)
          if(room.meetingRoomUsageData && room.meetingRoomUsageData.length > 0) {
            room.meetingRoomUsageData.forEach(meeting => {
              let meetingStart = meeting.satrtTime;
              meetingStart = moment(meetingStart, "YYYY-MM-DD HH:mm"); //会议开始时间
              let meetingEnd = meeting.endTime;
              meetingEnd = moment(meetingEnd, "YYYY-MM-DD HH:mm"); //会议结束时间
              let { count, enterIndex } = this.computedRoomTime({meetingStart, meetingEnd})
              meeting.count = count; // 计算占用多少格
              meeting.roomIndex = ri; // 计算定位top
              meeting.enterIndex = enterIndex; // 计算定位left
              meeting.room = `${room.roomClass}${room.roomName}`
              if (meeting.isAttend && meeting.isAttend == 1) { // 已参会
                meeting.color = this.legendList.find(k => k.value == 5)?.color
              } else {
                meeting.color = this.legendList.find(k => k.value == meeting.status)?.color
              }
              this.blockList.push(meeting);
            })
          }
        })
        this.blockList = this.blockList.filter(k => k.count > 0)
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
        const sectionWidth = tdWidth / this.theadList.length;
        
        let tdHeight = tableEle && tableEle.querySelector('td').offsetHeight;
        
        this.blockList.forEach((block, index) => {
          const styleObject = {};
          styleObject["left"] = sum + sectionWidth * block.enterIndex + "px";
          styleObject["width"] = sectionWidth * block.count + "px";
          styleObject['top'] = (block.roomIndex * tdHeight) + tdHeight + 'px';
          window.IDM.setStyleToPageHead(
            this.moduleObject.id +
              " .roomtable .idm-meeting-room-card-block-outer .idm-meeting-room-card-block:nth-child(" +
              (index + 1) +
              ")",
            styleObject
          );
        })
      })
    },
    showTimeTd(td, index) {
      return td.start
      // const m = td.start.slice(3);
      // if (m === "00") {
      //   return td.start;
      // }
      // if (m === "30") {
      //   return "";
      // }
    },
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
.roomtable{
  color: #333;
  font-size: 16px;
  .cursor{
    cursor: pointer;
  }
  
  .ellipsis{
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
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
  .idm-meeting-room-card-wrapper{
    width: 100%;
    // max-height: calc(100vh - 230px);
    // height: calc(100vh - 230px);
    max-height: 100%;
    height: 100%;
    border: 1px solid #ddd;
    position: relative;
    ::v-deep .simplebar-scrollbar:before {
      background-color: #e8e8e8;
    }
  }
  .idm-meeting-room-card-table{
    width: 100%;
    height: 100%;
    border-collapse: unset;
    table-layout: fixed;
    border: 0;
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
    .table-time-bar{
      // table-layout: fixed;
      position: sticky;
      left: 0;
      top: 0;
      z-index: 2;
      user-select: none;
      background-color: #f9fcfe;
      td:last-child{
        border-right-color: transparent;
      }
    }
    thead span{
      width: 54px;
      height: 50px;
    }
    td {
      height: 50px;
      text-align: center;
      width: 54px;
      border: 1px solid #ddd;
      border-top-color: transparent;
      border-left-color: transparent;
    }
    .mouse{
      background-color: #4ea6e0;
    }
    .td-name{
      position: sticky;
      left: 0;
      top: 0;
      width: 200px;
      background: #f9fcfe;
      z-index: 2;
      // border-top-color: transparent;
      // border-left-color: transparent;
      span {
        display: inline-block;
        width: 100%;
        height: 100%;
        line-height: 50px;
        // border-right: 1px solid #ddd;
      }
    }
    .td-namesignle{
      width: 120px;
      position: sticky;
      left: 0;
      top: 0;
      background: #f9fcfe;
      z-index: 2;
      border-top-color: transparent;
      border-left-color: transparent;
      span {
        display: inline-block;
        width: 100%;
        height: 100%;
        line-height: 50px;
        // border-right: 1px solid #ddd;
      }
    }
    .tdsignleleft{
      left: 120px;
    }
    .td-time {
      height: 50px;
      line-height: 50px;
      background: #f9fcfe;
      span {
        display: inline-block;
        width: 100%;
        height: 100%;
        line-height: 50px;
        background-color: #f9fcfe;
        // border-right: 1px solid #ddd;
      }
      &:last-child span {
        // border-right: none;
      }
    }
    .td-room{
      user-select: none;
      pointer-events: none;
      width: 188px;
      position: sticky;
      left: 0;
      background-color: #f9fcfe;
      z-index: 1;
      overflow: hidden;
      span {
        display: inline-block;
        width: 100%;
        height: 100%;
        line-height: 50px;
        white-space: nowrap;
        // overflow: hidden;
        // text-overflow: ellipsis;
        // display: flex;
        // align-items: center;
        // justify-content: center;
        // border-right: 1px solid #ddd;
      }
    }
    .tdroomflex{
      left: 120px;
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
