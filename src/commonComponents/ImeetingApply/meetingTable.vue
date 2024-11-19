<template>
  <div class="meetingtable" :style="`height: ${propData.meetingTableHeight}`">
    <simplebarvue class="idm-meeting-room-card-wrapper" :style="`max-height: ${propData.meetingTableHeight}`">
      <!--色块-->
      <div class="idm-meeting-room-card-block-outer">
        <div v-for="(block, b) in blockList" :key="b" class="idm-meeting-room-card-block" :style="`top:${(block.roomIndex * 50)+50}px`" @click="handleOpenUrl(block)">
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
        <tbody>
          <tr class="table-time-bar">
            <td ref="tableTdName" class="td-name"><span></span></td>
            <td class="td-time" :key="t" v-for="(td, t) in theadList">
              <span>{{ showTimeTd(td) }}</span>
            </td>
          </tr>
          <tr v-for="(roomitem, r) in roomList" :key="r"
            @mouseenter="handleTrMouseEnter"
            @mousedown="(e) => handleTrMouseDown(e, selectRoom)"
            @mousemove="handleTrMouseMove"
            @mouseup="handleTrMouseUp">
            <td class="td-room" :class="{ 'holiday': r>=5 }"><span>星期{{ weekCn[r] }} {{ roomitem.roomName }}</span></td>
            <td v-for="(td1, k) in theadList"
              :class="!showTips({start: `${roomitem.roomName} ${td1.start}`}) && 'cursor'"
              :key="k"
              :start="`${roomitem.roomName} ${td1.start}`"
              :end="`${roomitem.roomName} ${td1.end}`"
              class="td-item"
              @click="handleClickTd(roomitem, {start: `${roomitem.roomName} ${td1.start}`, end: `${roomitem.roomName} ${td1.end}`})">
              <template v-if="showTips({start: `${roomitem.roomName} ${td1.start}`})">
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
import moment from "moment";
import ImeetingApply from '../../mixins/ImeetingApply';
moment.suppressDeprecationWarnings = true
import API from '../../api/meeting';
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
    }
  },
  mixins: [ImeetingApply],
  data() {
    return {
      weekCn: ["一", "二", "三", "四", "五", "六", "日"],
      // 会议室
      roomList: [],
      // 头部
      theadList: [],
      // 开始小时时间
      startHourTime: '',
      // 结束小时时间
      endHourTime: '',
      // 开始时间
      startTime: '',
      // 结束时间
      endTime: '',
      // 色块
      blockList: [],
      // 当前room
      selectRoom: {},
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
      let { td } = this.jumpParams
      let moduleId  = '190111184257QgSNR8cW92akDpqeWMA';
      if(IDM.url.queryString("type")=="hysyd"){
        moduleId = "1905311647221BSf1doWPYLsr8nAdqB";
      }
      try{
        let start = td.start
        let end = td.end
        let room = this.selectRoom
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
    // 点击td
    async handleClickTd(room, td) {
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
            let start = td.start
            let end = td.end
            let room = this.selectRoom
            const url = window.IDM.url.getURLRoot() + "ctrl/formControl/form?moduleId="+moduleId+"&startTime=" + start+"&endTime="+end+"&roomId="+room.roomId+"&roomName="+encodeURI(room.roomName);
            window.open(url)
          }
        } else {
          let start = td.start
          let end = td.end
          let room = this.selectRoom
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
      return moment(start).isBefore(moment().format("YYYY-MM-DD HH:mm"))
    },
    // 初始化
    initTable(data, selectRoom) {
      this.selectRoom = selectRoom;
      this.roomList = [];
      this.theadList = [];
      this.blockList = [];
      this.startHourTime = data.workingStartTime
      this.endHourTime = data.offDutyEndTime
      this.startTime = data.showStartDate
      this.endTime = data.showEndDate
      // 初始化 表头
      this.initThead()
      // 初始化会议室 计算色块
      this.initRoom(data.room)
      // 渲染色块
      this.initBlock();
    },
    // 初始化表头
    initThead() {
      let start = moment(this.startHourTime, "HH:mm");
      let end = moment(this.endHourTime, "HH:mm");
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
    computedRoomTime({meetingStart, meetingEnd, currentYear}) {
      let count = 0, enterIndex = 0, bettwen = false;
      let start = currentYear + " " + this.theadList[0].start,
        end = currentYear + " " + this.theadList[this.theadList.length-1].end;
      // 第一种：开始时间早于表格最早时间或等于最早时间、结束时间晚于表格最晚时间或等于晚于时间 就是整个表格宽度
      // 第二种：开始时间早于表格最早时间、结束时间在表格中间 就要循环表格看占用了多少格
      // 第三种：开始时间在表格中间、结束时间晚于表格最晚时间，
      // 第四种：结束时间早于表格最早时间 不处理
      if ((meetingStart.isBefore(moment(start, "YYYY-MM-DD HH:mm")) || meetingStart.isSame(moment(start, "YYYY-MM-DD HH:mm")))
        && (meetingEnd.isAfter(moment(end, "YYYY-MM-DD HH:mm")) || meetingEnd.isSame(moment(end, "YYYY-MM-DD HH:mm")))) {
        count = this.theadList.length;
        enterIndex = 0
      } else if (meetingStart.isBefore(moment(start, "YYYY-MM-DD HH:mm")) && meetingEnd.isBetween(moment(start, "YYYY-MM-DD HH:mm"), moment(end, "YYYY-MM-DD HH:mm"), null, '[]')) {
        enterIndex = 0
        this.theadList.forEach((section, index) => {
          // 时间段开始时间
          const sectionStart = moment(
            currentYear + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            currentYear + " " + section.end,
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
            currentYear + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            currentYear + " " + section.end,
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
            currentYear + " " + section.start,
            "YYYY-MM-DD HH:mm"
          );
          // 时间段结束数据
          const sectionEnd = moment(
            currentYear + " " + section.end,
            "YYYY-MM-DD HH:mm"
          );
          // 进入时间段
          if(meetingStart.isBetween(sectionStart, sectionEnd) ||  sectionStart.isSame(meetingStart)) {
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
    initRoom(room) {
      let start =  moment(this.startTime, "YYYY-MM-DD");
      let end = moment(this.endTime, "YYYY-MM-DD");
      if (start.isBefore(end) || start.isSame(end)) {
        while (start.isBefore(end) || start.isSame(end)) {
          this.roomList.push({
            roomName: start.format('YYYY-MM-DD'),
          })
          start = moment(start).add(1, 'days')
        }
      } else {
        for(let i=1; i<=7; i++) {
          this.roomList.push({
            roomName: start.format('YYYY-MM-DD'),
          })
          start = moment(start).add(1, 'days')
        }
      }
      let that = this
      this.roomList.forEach((item, ri) => {
        if (room && room.length > 0) {
          room.forEach((roomitem, i) => {
            if (roomitem.meetingRoomUsageData && roomitem.meetingRoomUsageData.length > 0) {
              roomitem.meetingRoomUsageData.forEach(meeting => {
                let copymeeting = JSON.parse(JSON.stringify(meeting))
                let meetingStart = copymeeting.satrtTime;
                meetingStart = moment(meetingStart, "YYYY-MM-DD HH:mm"); //会议开始时间
                let meetingEnd = copymeeting.endTime;
                meetingEnd = moment(meetingEnd, "YYYY-MM-DD HH:mm"); //会议结束时间
                let { count, enterIndex } = this.computedRoomTime({meetingStart, meetingEnd, currentYear: item.roomName})
                copymeeting.count = count; // 计算占用多少格
                copymeeting.roomIndex = ri; // 计算定位top
                copymeeting.enterIndex = enterIndex; // 计算定位left
                if (meeting.isAttend && meeting.isAttend == 1) { // 已参会
                  copymeeting.color = this.legendList.find(k => k.value == 5)?.color
                } else {
                  copymeeting.color = this.legendList.find(k => k.value == copymeeting.status)?.color
                }
                that.blockList.push(copymeeting);
              })
            }
          })
        }
      })
      this.blockList = this.blockList.filter(k => k.count > 0)
    },
    // 渲染色块
    initBlock() {
      this.$nextTick(() => {
        const tableEle = this.$refs.table;
        const firstTdWidth = this.$refs.tableTdName.offsetWidth;
        const tdWidth = tableEle.offsetWidth - firstTdWidth;
        const sectionWidth = tdWidth / this.theadList.length;
        this.blockList.forEach((block, index) => {
          const styleObject = {};
          styleObject["left"] = firstTdWidth + sectionWidth * block.enterIndex + "px";
          styleObject["width"] = sectionWidth * block.count + "px";
          window.IDM.setStyleToPageHead(
            this.moduleObject.id +
              " .meetingtable .idm-meeting-room-card-block-outer .idm-meeting-room-card-block:nth-child(" +
              (index + 1) +
              ")",
            styleObject
          );
        })
      })
    },
    showTimeTd(td, index) {
      const m = td.start.slice(3);
      if (m === "00") {
        return td.start;
      }
      if (m === "30") {
        return '';
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.meetingtable{
  height: calc(100vh - 480px);
  .cursor{
    cursor: pointer;
  }
  .idm-meeting-room-card-wrapper{
    width: 100%;
    max-height: 100%;
    border: 1px solid #ddd;
    position: relative;
    ::v-deep .simplebar-scrollbar:before {
      background-color: #e8e8e8;
    }
  }
  .holiday {
    color: #EC4519 !important;
  }
  .idm-meeting-room-card-block-outer{
    position: relative;
    .idm-meeting-room-card-block{
      overflow: hidden;
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
    border-collapse: collapse;
    table-layout: fixed;
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
    td {
      height: 50px;
      text-align: center;
      width: 54px;
      border: 1px solid #ddd;
      font-size: 16px;
      color: #333;
    }
    .mouse{
      background-color: #4ea6e0;
    }
    .td-name{
      width: 150px;
      position: sticky;
      left: 0;
      bottom: 0;
      background: #f9fcfe;
      z-index: 2;
      span {
        display: inline-block;
        width: 100%;
        height: 100%;
        line-height: 50px;
        // border-right: 1px solid #ddd;
      }
    }
    .td-time{
      background: #f9fcfe;
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
