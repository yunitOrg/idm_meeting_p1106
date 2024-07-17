<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
  >
    <div class="meetingweekmg-wrap">
      <div class="meeting-top mrl20">
        <div class="meeting-left">
          <span class="mr20">值班秘书：<span>{{ allData.secretary }}</span></span>
          <span>值班电话：<span>{{ allData.secretaryPhone }}</span></span>
        </div>
        <div class="meeting-center">
          <weekReport :value.sync="selectWeekObj" @handleRefresh="handleReWeekData"></weekReport>
        </div>
        <div class="meeting-right displayflex">
          <span>说明：</span>
          <div class="meeting-legend displayflex">
            <div class="legend-item" v-for="(legend, l) in legendList" :key="l">
              <span
                class="legend-item-circle"
                :style="`background-color:${legend.color}`"
              ></span>
              <span class="legend-item-text">{{ legend.text }}</span>
            </div>
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="meetintable" :style="`height: ${propData.tableHeight}`">
        <div :style="`height: ${propData.tableContent}`">
          <a-spin class="weekapply-loading" :spinning="loading"></a-spin>
          <simplebarvue class="idm-meeting-room-card-wrapper">
            <table ref="table" class="idm-meeting-room-card-table" border="1" cellspacing="0">
              <thead>
                <tr class="room-sticky">
                  <td ref="tableTdName"  rowspan="2" class="room-thead">
                    <div class="td-name">
                        会议室名称
                      <span class="table-arrow"></span>
                    </div>
                  </td>
                  <td class="td-time" v-for="(td, t) in theadCopyList" :key="t">
                    <div class="td-block" :class="checkCurrentDay(td) ? 'currentDay': ''">
                      <div class="td-day">{{ weekCn[t] }}</div>
                      <span>{{ td.dayCut }}
                        <i :class="{
                          red: td.type == '1',
                          blue: td.type == '2'
                        }">{{ td.tip }}</i>
                      </span>
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody class="tabletbody" v-if="showtable">
                <tr v-for="(room, r) in roomList" :key="r">
                  <td class="td-room">
                    <div class="td-div-head">
                      <span>{{ room.roomName }}</span>
                      <div>可容纳：{{ room.capacity }}人</div>
                    </div>
                  </td>
                  <template v-for="(td, subindex) in theadCopyList">
                    <td :key="subindex"
                      class="td-item">
                      <div class="td-div"></div>
                      <div class="block-btn-img" @click.stop="handleChildJump(room, td)"><i></i></div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </simplebarvue>
        </div>
        <!--按钮-->
        <div class="meetingaddbtn" @click="handleJumpUrl">
          <i></i>
          <span>会议室申请</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import weekReport from '../commonComponents/ImeetingApply/weekReport.vue'
import simplebarvue from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import { getMeetingData } from '../utils/mock';
import moment from "moment";
import API from '../api/index'
export default {
  name: 'ImeetingWeekMgr',
  components: {
    simplebarvue,
    weekReport
  },
  data() {
    return {
      selectWeekObj: {
        start: '',
        end: ''
      },
      loading: false,
      showtable: true,
      allData: {},
      year: '',
      weekCn: ["一", "二", "三", "四", "五", "六", "日"],
      // 工作 开始时间
      workStar: '',
      // 工作 结束时间
      workEnd: '',
      // 色块
      blockList: [],
      // 会议室
      roomList: [],
      // 头部
      theadList: [],
      theadCopyList: [],
      // 图例
      legendList: [
        {
          color: "#499BFC",
          text: "待审核",
          value: 1
        },
        {
          color: "#20B759",
          text: "与占用",
          value: 2
        },
        {
          color: "#B8B8B8",
          text: "已过期",
          value: 3
        }
      ],
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        width: '100%',
        height: '100%',
        tableHeight: 'calc(100vh - 90px)',
        tableContent: 'calc(100vh - 179px)',
        ulbox: {
          marginTopVal: "",
          marginRightVal: "",
          marginBottomVal: "",
          marginLeftVal: "",
          paddingTopVal: "20px",
          paddingRightVal: "20px",
          paddingBottomVal: "10px",
          paddingLeftVal: "20px"
        }
      }
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.init();
  },
  methods: {
    handleChildJump(room, td) {
      if (this.propData.handleMeetingJump && this.propData.handleMeetingJump.length > 0) {
        let name = this.propData.handleMeetingJump[0].name
        window[name] && window[name].call(this, {
          _this: this,
          data: {
            room: room,
            time: td
          }
        });
      }
    },
    // 会议室申请跳转url
    handleJumpUrl() {
      if (this.propData.handleJump && this.propData.handleJump.length > 0) {
        let name = this.propData.handleJump[0].name
        window[name] && window[name].call(this, {
          _this: this,
          data: this.allData
        });
      }
    },
    // 检测是否当天
    checkCurrentDay(td) {
      let day = `${this.year}.${td.dayCut}`.replace(/\./g, '-');
      return moment(moment().format('YYYY-MM-DD')).isSame(moment(day))
    },
    handleReWeekData() {
      this.requireData()
    },
     /**
     * @Desc 设置样式
     */
     handleStyle() {
      let styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key]
          if (!element && element !== false && element != 0) {
            continue
          }
          switch (key) {
            case 'width':
              styleObject['width'] = element;
              break
            case 'height':
              styleObject['height'] = element;
              break
            case 'ulbox':
              IDM.style.setBoxStyle(styleObject, element)
              break
            case 'bgColor':
              styleObject['background-color'] = element && element.hex8;
              break
            case 'boxShadow':
              styleObject['box-shadow'] = element;
              break
            case 'boxborder':
              IDM.style.setBorderStyle(styleObject, element);
              break
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .meetingweekmg-wrap", styleObject);
    },
    // 初始化表头
    initThead() {
      let start =  moment(this.selectWeekObj.start, "YYYY-MM-DD");
      let end = moment(this.selectWeekObj.end, "YYYY-MM-DD");
      if (start.isBefore(end) || start.isSame(end)) {
        while (start.isBefore(end) || start.isSame(end)) {
          this.theadCopyList.push({
            day: start.format('YYYY-MM-DD'),
            dayCut: start.format('MM.DD')
          })
          start = moment(start).add(1, 'days')
        }
      } else {
        for(let i=1; i<=7; i++) {
          this.theadCopyList.push({
            day: start.format('YYYY-MM-DD'),
            dayCut: start.format('MM.DD')
          })
          start = moment(start).add(1, 'days')
        }
      }
    },
    initTable(data) {
      this.theadList = [];
      this.theadCopyList = [];
      this.roomList = [];
      this.blockList = [];
      
      this.allData = data;
      this.workStar = data.workingStartTime;
      this.workEnd = data.offDutyEndTime;
      // this.theadList = data.thead;
      this.roomList = data.room;
      this.year = this.selectWeekObj?.start?.split('-')[0]

      // 初始化表头
      this.initThead()
      // 计算色块
      this.initRoom()
      // 渲染色块
      this.initBlock()
    },
    // 渲染色块
    initBlock() {
      this.$nextTick(() => {
        let trAll = document.querySelectorAll('.tabletbody tr');
        if (trAll.length <= 0) return
        this.blockList.forEach(item => {
          let start = item.satrtTime?.split(' ')[1];
          let s = start.split(':');
          start = `${s[0]}:${s[1]}`;
          let end = item.endTime?.split(' ')[1];
          let e = end.split(':');
          end = `${e[0]}:${e[1]}`;

          let people = item.attendUserNum ? `<span>参会：${item.attendUserNum}人</span>` : '';
          let bgcolor = '#F9F9F9';
          if (item.colorType == 1) {
            bgcolor = '#F3F8FF'
          } else if (item.colorType == 2) {
            bgcolor = '#F3FFF7'
          } else if (item.colorType == 9) {
            bgcolor = '#F9F9F9'
          } else if (item.colorType == 0) {
            bgcolor = '#FEF5F5'
          }
          let jsonitem = JSON.stringify(item).replace(/\"/g, "'");
          let str = `<div class="block-center" style='background-color:${bgcolor};'>
              <div style="width:30%;display:flex;flex-direction:column;align-items:center;justify-content:space-around;">
                <span>${start}</span>
                <span>|</span>
                <span>${end}</span>
              </div>
              <div style="border-left: 3px solid ${item.color};margin-left:5px;padding-left:10px;display:flex;flex-direction:column;justify-content:space-between;color:#333;width:70%;">
                <div>${item.bt}</div>
                <div style="display:flex;justify-content:space-between">
                  <span>${item.ngr}</span>
                  ${people}
                </div>
              </div>
            </div>`
          let line = trAll[item.roomIndex];
          let lie = line.querySelectorAll('td')[item.enterIndex];
          if (lie && lie.innerHTML) {
            lie.innerHTML = lie.innerHTML + str
          } else {
            lie && (lie.innerHTML = str)
          }
        })
      })
    },
    // 计算颜色   status: 0: 红色  1 待审核 2 已占用 9 已过期
    hanldeColorBlock(meeting) {
      if (meeting.status == 0) {
        meeting.color = '#EB3333';
        meeting.colorType = 0;
      } else if (meeting.status == 1 ) {
        meeting.color = this.legendList[0].color;
        meeting.colorType = 1;
      } else if (meeting.status == 2) {
        meeting.color = this.legendList[1].color;
        meeting.colorType = 2;
      } else if (meeting.status == 9) {
        meeting.color = this.legendList[2].color;
        meeting.colorType = 9;
      }
    },
    /**
     * @Desc 计算会议室占用时间
     * roomIndex：行数
     * enterIndex：列
     */
     computedRoomTime(meeting, ri, roomId) {
      let meetingStart = meeting.satrtTime;
      meetingStart = moment(meetingStart, "YYYY-MM-DD HH:mm"); //会议开始时间
      let meetingEnd = meeting.endTime;
      meetingEnd = moment(meetingEnd, "YYYY-MM-DD HH:mm"); //会议结束时间
      this.theadCopyList.forEach((section, i) => {
        //时间段开始时间
        const sectionStart = moment(
          section.day + " " + this.workStar,
          "YYYY-MM-DD HH:mm"
        );
        // 时间段结束数据
        const sectionEnd = moment(
          section.day + " " + this.workEnd,
          "YYYY-MM-DD HH:mm"
        );
        const addfunc = (meeting, params) =>  {
          let obj = Object.assign({}, meeting, params)
          this.hanldeColorBlock(obj)
          this.blockList.push(obj);
        }
        if ((sectionStart.isBetween(meetingStart, meetingEnd) || sectionStart.isSame(meetingStart))
          || (sectionStart.isBefore(meetingStart) && sectionEnd.isAfter(meetingEnd))
          || (sectionStart.isBefore(meetingStart) && sectionEnd.isSame(meetingEnd))
          || (sectionStart.isBefore(meetingStart) && sectionEnd.isBetween(meetingStart, meetingEnd))) {
          addfunc(meeting, { count: 1, roomIndex: ri, enterIndex: i+1, section: section, roomId: roomId })
        }
      });
    },
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
    getMockData() {
      let obj = getMeetingData();
      this.initTable(obj)
    },
    async requireData() {
      if (this.moduleObject.env !== 'production') {
        this.getMockData()
        return
      }
      this.loading = true;
      this.showtable = false;
      let obj = {
        startTime: this.selectWeekObj.start,
        endTime: this.selectWeekObj.end
      }
      let res = await API.ApiMeeting(obj);
      if(res.code == '200') {
        this.loading = false;
        this.showtable = true;
        this.initTable(res.data)
      } else {
        this.loading = false;
        this.showtable = true;
      }
    },
    init() {
      this.handleStyle()
      this.requireData();
    }
  }
}
</script>

<style lang="scss">
.block-center{
  margin-bottom:10px;
  border-radius:5px;
  padding:5px;
  box-sizing:border-box;
  display:flex;
  justify-content:space-between;
  color:#333;
  position: relative;
}
</style>

<style lang="scss" scoped>
.meetingweekmg-wrap{
  .block-btn-img{
    display: none;
    text-align: center;
    cursor: pointer;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width:24px;
    height:24px;
    z-index: 9;
    background-color: #207EEA;
    border-radius:5px;
    i{
      display: inline-block;
      width: 18px;
      height: 18px;
      background-image: url('../assets/plus.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      margin-top: 3px;
    }
  }
  .weekapply-loading{
    position: absolute;
    top: 50%;
    left: 50%;
  }
  .displayflex{
    display: flex;
  }
  .mr20{
    margin-right: 20px;
  }
  .mrl20{
    padding: 0 20px;
  }
  .meeting-top{
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #EAECF3;
    height: 50px;
    border-radius: 20px 20px 0 0;
    .meeting-left{
      font-size: 16px;
      color: #333333;
    }
    .meeting-right{
      .meeting-legend{
        margin-left: 10px;
      }
      .legend-item{
        margin-right: 20px;
        color: #333333;
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
  .meetintable{
    position: relative;
    background-color: #fff;
    border-radius: 20px 20px 20px 20px;
    padding: 29px 20px 0 20px;
    background-image: url('../assets/tu-1.png');
    background-repeat: no-repeat;
    background-size: 100% 15px;
    background-position: top;
    .idm-meeting-room-card-wrapper{
      width: 100%;
      max-height: 100%;
      height: 100%;
      // border: 1px solid #ddd;
      position: relative;
      ::v-deep .simplebar-scrollbar:before {
        background-color: #e8e8e8;
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
        background-color: #fff;
      }
      .table-arrow{
        width: 6px;
        height: 6px;
        border: 6px solid transparent;
        border-top-color: #333;
        margin-top: 5px;
      }
      thead{
        td{
          text-align: center;
          width: 90px;
          height: 70px;
        }
      }
      .td-item{
        position: relative;
        &:hover{
          .block-btn-img{
            display: block;
          }
        }
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
        td{
          width: 90px;
          padding: 10px 0;
        }
        .td-div{
          // width: 100%;
          // height: 100%;
          // margin: 10px 5px;
          // min-height: 80px;
        }
        .td-div-head{
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80px;
          background-color: #F0F6FF;
          margin: 10px 5px;
          span{
            color: #1C7BE9;
            font-weight: 600;
            font-size: 20px;
          }
          div{
            margin-top: 5px;
            color: #333333;
            font-size: 14px;
          }
        }
      }
      td{
        border: 1px solid #E6E6E6;
        border-left-color: transparent;
        border-top-color: transparent;
        border-right-color: transparent;
      }
      .room-thead{
        border-right-color: transparent;
      }
      .td-time{
        position: sticky;
        left: 0;
        top: 0;
        z-index: 3;
        border-right-color: transparent;
        border-top-color: transparent;
        .td-block{
          height: 70px;
          background-color: #F4F5F8;
          margin: 10px 5px;
          border-radius: 2px;
        }
        .td-day{
          padding-top: 5px;
          font-size: 20px;
          color: #333;
        }
        span{
          font-weight: 600;
          font-size: 22px;
          position: relative;
        }
        i{
          display: inline-block;
          font-size: 12px;
          font-style: normal;
          position: absolute;
          right: -18px;
          top: -2px;
        }
        .red{
          color: #EB3333;
        }
        .blue{
          color: #1C7BE9;
        }
      }
      .currentDay{
        background-image:  linear-gradient(270deg, #63A9FA 0%, #1C7BE9 100%);
        color: #fff;
        border-radius: 5px !important;
        .td-day{
          color: #fff;
        }
      }
      td{
        // border: 1px solid #ddd;
        border-top-color: transparent;
        border-left-color: transparent;
        font-weight: 500;
        color: #333;
      }
      .td-time:last-child{
        border-right-color: transparent;
      }
      .td-noon:last-child{
        border-right-color: transparent;
      }
      .td-name{
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-color: #F4F5F8;
        font-size: 16px;
        font-weight: 600;
        margin: 10px 5px;
      }
      .td-room{
        user-select: none;
        pointer-events: none;
      }
    }
  }
  .meetingaddbtn{
    cursor: pointer;
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    margin: 10px auto 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 137px;
    height: 36px;
    background-image: linear-gradient(-89deg, #63A9FA 0%, #1C7BE9 100%);
    border-radius: 4px;
    color: #fff;
    font-size: 16px;
    i{
      display: inline-block;
      width: 18px;
      height: 18px;
      background-image: url('../assets/plus.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      margin-right: 5px;
    }
  }
}
</style>

