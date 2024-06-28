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
    <div class="iweekapply">
      <div class="mt20 flexcenter">
        <weekReport :value.sync="selectWeekObj" @handleRefresh="handleReWeekData"></weekReport>
      </div>
      <!--表格-->
      <div class="weektable" :style="`height: ${propData.tableHeight}`">
        <a-spin class="weekapply-loading" :spinning="loading"></a-spin>
        <simplebarvue class="idm-meeting-room-card-wrapper">
          <table ref="table" class="idm-meeting-room-card-table" border="1" cellspacing="0">
            <thead>
              <tr class="room-sticky">
                <template v-if="isShowBuilding">
                  <td ref="tableTdStyle" class="td-name" rowspan="2">会议室类型</td>
                  <td ref="tableTdName" class="td-name" rowspan="2">会议室名称</td>
                </template>
                <template v-else>
                  <td ref="tableTdName" class="td-name" rowspan="2">会议室名称</td>
                </template>
                <td class="td-time" v-for="(td, t) in theadList" :key="t" :class="{
                  'holiday': t>=5
                }">
                  <div>星期{{ weekCn[t] }}</div>
                  {{ td.day }}
                </td>
              </tr>
            </thead>
            <tbody class="tabletbody" v-if="showtable">
              <tr v-for="(room, r) in roomList" :key="r">
                <template v-if="isShowBuilding">
                  <td class="td-room">
                    <div class="td-div">
                      <span>{{ room.roomClass }}</span>
                    </div>
                  </td>
                  <td class="td-room">
                    <div class="td-div">
                      <span>{{ room.roomName }}</span>
                      <div>({{ room.capacity }}人)</div>
                    </div>
                  </td>
                </template>
                <template v-else>
                  <td class="td-room">
                    <div class="td-div">
                      <span>{{ room.roomClass }} {{ room.roomName }}</span>
                      <div>({{ room.capacity }}人)</div>
                    </div>
                  </td>
                </template>
                <template v-for="(td, subindex) in theadList">
                  <td :key="subindex"
                      :class="{
                      'holiday': subindex>=5
                    }"
                    class="td-item">
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </simplebarvue>
      </div>
      <!--图例-->
      <div class="idm-meeting-room-card-legend" :style="`bottom:${propData.legendBottomDis}`">
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
</template>

<script>
import weekReport from '../commonComponents/ImeetingApply/weekReport.vue'
import simplebarvue from "simplebar-vue";
import "simplebar-vue/dist/simplebar.min.css";
import API from '../api/index'
import moment from "moment";
export default {
  name: 'IWeekApply',
  components: {
    simplebarvue,
    weekReport
  },
  data() {
    return {
      loading: false,
      selectWeekObj: {
        start: '',
        end: ''
      },
      showtable: true,
      weekCn: ["一", "二", "三", "四", "五", "六", "日"],
      // 日期 开始时间
      startTime: '',
      // 日期 结束时间
      endTime: '',
      // 工作 开始时间
      workStar: '0:00',
      // 工作 结束时间
      workEnd: '24:00',
      // 色块
      blockList: [],
      // 会议室
      roomList: [],
      // 头部
      theadList: [],
      // 图例
      legendList: [
        {
          color: "#333",
          text: "全部会议",
          value: 1
        },
        {
          color: "#FFA500",
          text: "与我相关的会议",
          value: 2
        }
      ],
      isShowBuilding: false,
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        width: '100%',
        height: '100%',
        tableHeight: 'calc(100vh - 120px)',
        legendBottomDis: '5px',
        ulbox: {
          marginTopVal: "",
          marginRightVal: "",
          marginBottomVal: "",
          marginLeftVal: "",
          paddingTopVal: "20px",
          paddingRightVal: "20px",
          paddingBottomVal: "",
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
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .iweekapply", styleObject);
    },
    // 初始化表头
    initThead() {
      let start =  moment(this.startTime, "YYYY-MM-DD");
      let end = moment(this.endTime, "YYYY-MM-DD");
      if (start.isBefore(end) || start.isSame(end)) {
        while (start.isBefore(end) || start.isSame(end)) {
          this.theadList.push({
            day: start.format('YYYY-MM-DD'),
          })
          start = moment(start).add(1, 'days')
        }
      } else {
        for(let i=1; i<=7; i++) {
          this.theadList.push({
            day: start.format('YYYY-MM-DD'),
            noon: this.noon
          })
          start = moment(start).add(1, 'days')
        }
      }
    },
    initTable(data) {
      this.theadList = [];
      this.roomList = [];
      this.blockList = [];

      this.startTime = data.showStartDate;
      this.endTime = data.showEndDate;
      this.isShowBuilding = data.isShowBuilding;
      // this.workStar = data.workingStartTime;
      // this.workEnd = data.offDutyEndTime;
      this.roomList = data.room;
      
      // 初始化表头
      this.initThead()
      // 计算色块
      this.initRoom()
      // 渲染色块
      this.initBlock()
    },
    // 渲染色块
    initBlock() {
      let timeimg = IDM.url.getModuleAssetsWebPath(require('../assets/time.png'), this.moduleObject);
      let peopleimg = IDM.url.getModuleAssetsWebPath(require('../assets/people.png'), this.moduleObject);
      this.$nextTick(() => {
        let trAll = document.querySelectorAll('.tabletbody tr');
        if (trAll.length <= 0) return
        this.blockList.forEach(item => {
          let start = '', end = '';
          if (moment(item.satrtTime, "YYYY-MM-DD").isSame(moment(item.endTime, "YYYY-MM-DD"))) {
            start = item.satrtTime.split(' ')[1];
            let s = start.split(':');
            start = `${s[0]}:${s[1]}`;
            
            end = item.endTime.split(' ')[1];
            let e = end.split(':');
            end = `${e[0]}:${e[1]}`;
          } else {
            start = item.satrtTime?.substring(0, item.satrtTime.length - 3);
            end = item.endTime?.substring(0, item.endTime.length - 3);
          }

          let people = item.attendUserNum ? `<span>${item.attendUserNum}</span>人` : ''
          let str = `<div class="block-center" style='color:${item.color};margin-bottom:10px;'>
              <div><img style='width:15px;margin-right:3px;' src='${timeimg}'/> ${start}-${end}</div>
              <div>${item.bt}</div>
              <div><img style='width:15px;margin-right:3px;' src='${peopleimg}' />${item.ngr} ${people}</div>
            </div>`
          let line = trAll[item.roomIndex];
          let lie = line.querySelectorAll('td')[item.enterIndex];
          if (lie.innerHTML) {
            lie.innerHTML = lie.innerHTML + str
          } else {
            lie && (lie.innerHTML = str)
          }
        })
      })
    },
    // 计算颜色
    hanldeColorBlock(meeting) {
      if (meeting.isAttend == 1 || meeting.status == 2 ) { // 已参会
        meeting.color = this.legendList[1].color
      } else {
        meeting.color = this.legendList[0].color
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
      this.theadList.forEach((section, i) => {
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
              this.computedRoomTime(meeting, ri, room.roomId);
            })
          }
        });
        this.blockList = this.blockList.filter(k => k.count > 0);
      }
    },
    async requireData() {
      this.loading = true;
      this.showtable = false;
      let obj = {
        showStartDate: this.selectWeekObj.start,
        showEndDate: this.selectWeekObj.end
      }
      let res = await API.ApiWeekRoomList(obj)
      if (res.code == '200') {
        this.loading = false;
        this.showtable = true;
        let data = res.data || {};
        this.initTable(data)
      } else {
        this.loading = false;
        this.showtable = true;
      }
    },
    init() {
      this.handleStyle()
      this.requireData()
    }
  }
}
</script>

<style lang="scss" scoped>
.iweekapply{
  .weekapply-loading{
    position: absolute;
    top: 50%;
    left: 50%;
  }
  .flexcenter{
    display: flex;
    justify-content: center;
  }
  .mt20{
    margin-bottom: 20px;
  }
  .holiday{
    background-color: #FFFCF2 !important;
  }
  .weektable{
    color: #333;
    font-size: 16px;
    height: calc(100vh - 120px);
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
    thead{
      td{
        text-align: center;
        width: 90px;
        height: 70px;
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
        padding: 5px;
      }
      .td-div{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 80px;
      }
    }
    .td-time{
      position: sticky;
      left: 0;
      top: 0;
      z-index: 3;
      border-top-color: transparent;
      background-color: #f9fcfe;
    }
    td{
      border: 1px solid #ddd;
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
      border-left-color: transparent;
      border-top-color: transparent;
      background-color: #f9fcfe;
    }
    .td-room{
      user-select: none;
      pointer-events: none;
      background-color: #f9fcfe;
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
