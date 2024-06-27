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
    <div class="imeetingapply">
      <div class="meeting-tab">
        <div class="titleTop mlr20">
          <span v-for="(item, index) in tab" :key="index" :class="item.value == tabActivity&&'tabActivity'" @click="handleTab(item)">{{ item.label }}</span>
        </div>
        <div class="titleRight">
          <div class="title-day" v-if="tabActivity == 1">
            <span v-for="(item, index) in typeList" :key="index" :class="item.value == typeActivity&&'typeActivity'" @click="handleType(item)">{{ item.label }}</span>
          </div>
          <a-button class="title-timeslot" v-if="tabActivity == 1 || tabActivity == 2" shape="round" @click="customTimeDialog=true">自定义时间段</a-button>
        </div>
      </div>
      <a-spin class="meeting-loading" :spinning="loading"></a-spin>
      <!--按日期申请-->
      <template v-if="tabActivity == 1">
        <!--日查看-->
        <template v-if="typeActivity == 'day'">
          <div class="mtl20 date-top">
            <div class="date-left">
              <weekTime :value.sync="selectWeack" @change="handleWeekTime" ref="weekTime"></weekTime>
              <a-checkbox v-model="search.checkdBox" @change="handleRefreshTable" class="meeting-kong">只看当日空闲</a-checkbox>
              <a-popover v-model="mettingPopver" trigger="click" placement="bottom" overlayClassName="meeting-popover">
                <template slot="content">
                  <div class="meeting-popover-line" v-if="searchListDic.regionList">
                    <div>区域</div>
                    <span
                      v-for="(item, index) in searchListDic.regionList"
                      :key="index"
                      @click="handleSetSearch(item, 'region')"
                      :class="item.show && 'select'"
                    >{{ item.name }}</span>
                  </div>
                  <div class="meeting-popover-line" v-if="searchListDic.siteTypeList">
                    <div>类型</div>
                    <span
                      v-for="(item, index) in searchListDic.siteTypeList"
                      :key="index"
                      @click="handleSetSearch(item, 'site')"
                      :class="item.show && 'select'">{{ item.name }}</span>
                  </div>
                  <div class="meeting-popover-line" v-if="searchListDic.capacityList">
                    <div>容纳人数</div>
                    <span
                      v-for="(item, index) in searchListDic.capacityList"
                      :key="index"
                      @click="handleSetSearch(item, 'capa')"
                      :class="item.show && 'select'">{{ item.text }}</span>
                  </div>
                  <div class="meeting-popover-line" v-if="searchListDic.freeTimeList">
                    <div>空闲时间</div>
                    <span
                      v-for="(item, index) in searchListDic.freeTimeList"
                      :key="index"
                      @click="handleSetSearch(item, 'free')"
                      :class="item.show && 'select'">{{ item.name }}</span>
                  </div>
                  <div class="metting-popover-center">
                    <a-button @click="handlePopClear">清空</a-button>
                    <a-button type="primary" @click="handlePopSure">确认</a-button>
                  </div>
                </template>
                <span class="moreColor">更多选项</span>
              </a-popover>
            </div>
            <div class="date-right">
              <a-config-provider :locale="locale">
                <a-date-picker v-model="datePicker" @change="handleDatePicker" class="mrt20" style="color:#025FB2;width:130px;" />
              </a-config-provider>
              <a-button @click="hanleToDay">今天</a-button>
            </div>
          </div>
          <div class="meeting-table" v-if="load">
            <roomDayTable
              ref="roomDayTable"
              :moduleObject="moduleObject"
              :propData="propData"
              @colorJumpUrl="colorJumpUrl"
              >
            </roomDayTable>
          </div>
        </template>
        <!--周查看-->
        <template v-if="typeActivity == 'week'">
          <div class="mtl20">
            <weekReport :value.sync="selectWeekObj" @handleRefresh="handleReWeekData"></weekReport>
          </div>
          <div class="meeting-table">
            <weekTable
              ref="weekTable"
              :moduleObject="moduleObject"
              :weekListTable="weekListTable"
              :propData="propData"
              @colorJumpUrl="colorJumpUrl"
            ></weekTable>
          </div>
        </template>
      </template>
      <!--按会议室申请-->
      <template v-if="tabActivity == 2">
        <meetingRoom
          ref="meetingRoom"
          :moduleObject="moduleObject"
          :propData="propData"
          @colorJumpUrl="colorJumpUrl">
        </meetingRoom>
      </template>
      <!--我的申请-->
      <template v-if="tabActivity == 3">
        <iframe :src="iframeUrl()" frameborder="0" class="imeetingiframe" id="ImeetingApply" :style="`width:100%;height: ${propData.iframeHeight};`"></iframe>
      </template>
      <!--自定义时间段-->
      <a-modal
        v-model="customTimeDialog"
        title="自定义会议视图时间段"
        centered
        :maskClosable="false"
        okText="确定"
        cancelText="关闭"
        @ok="handleSetTime"
      >
       <div class="choosetime">
        <a-time-picker
          v-model="chooseTimeHourse.startTimeHourse"
          placeholder="开始时间"
          format="HH:mm"
          :minute-step="30"
          :second-step="10"
           />
        <span style="padding: 0 10px;">~</span>
        <a-time-picker
          v-model="chooseTimeHourse.endTimeHourse"
          placeholder="结束时间"
          format="HH:mm"
          :minute-step="30"
          :second-step="10" />
       </div>
      </a-modal>
    </div>
  </div>
  </template>

<script>
import locale from 'ant-design-vue/es/locale/zh_CN';
import weekTime from '../commonComponents/ImeetingApply/weekTime.vue';
import weekReport from '../commonComponents/ImeetingApply/weekReport.vue';
import roomDayTable from '../commonComponents/ImeetingApply/roomDayTable.vue';
import weekTable from '../commonComponents/ImeetingApply/weekTable.vue';
import meetingRoom from '../commonComponents/ImeetingApply/meetingRoom.vue';
import moment from "moment";
import API from '../api/meeting.js';
export default {
  name: 'ImeetingApply',
  components: {
    weekTime,
    weekReport,
    roomDayTable,
    weekTable,
    meetingRoom
  },
  data() {
    return {
      loading: false,
      locale,
      load: true,
      timeRange: [],
      tableData: {}, // 日 表格数据
      weekListTable: {}, // 周 表格数据
      showTime: {
        format: 'HH:mm'
      },
      search: {
        checkdBox: false
      },
      chooseTimeHourse: {
        startTimeHourse: null,
        endTimeHourse: null,
      },
      mettingPopver: false,
      tab: [{value: 1, label: '按日期申请'}, {value: 2, label: '按会议室申请'}, {value: 3, label: '我的申请'}],
      typeList: [{value: 'day', label: '日查看'}, {value: 'week', label: '周查看'}],
      searchListDic: {
        regionList: [], // 区域
        siteTypeList: [], // 类型
        capacityList: [], // 人数
        freeTimeList: [], // 空闲时间
      },
      selectWeack: moment().format("YYYY-MM-DD"),
      selectWeekObj: {
        start: '',
        end: ''
      },
      datePicker: moment(moment().format("YYYY-MM-DD"), "YYYY-MM-DD"),
      tabActivity: 1,
      typeActivity: 'day',
      moduleObject: {},
      customTimeDialog: false, // 时间段
      propData: this.$root.propData.compositeAttr || {
        iframeHeight: 'calc(100vh - 80px)',
        meetingTableHeight: 'calc(100vh - 480px)',
        legendBottomDis: '5px',
        meetingDayHei: 'calc(100vh - 230px)',
        meetingWeekHei: 'calc(100vh - 200px)',
        ulbox: {
          marginTopVal: "",
          marginRightVal: "",
          marginBottomVal: "",
          marginLeftVal: "",
          paddingTopVal: "20px",
          paddingRightVal: "20px",
          paddingBottomVal: "0",
          paddingLeftVal: "20px"
        }
      }
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.requireDic();
    this.init();
    // 挂载到window上
    window.meetingApply = {
      handleAgainRenderBlock: this.handleAgainRenderBlock
    }
  },
  methods: {
    // 重新渲染色块
    handleAgainRenderBlock() {
      if (this.tabActivity == 1) {
        if (this.typeActivity == 'day') {
          this.$refs.roomDayTable.initBlock()
        } else if (this.typeActivity == 'week') {
          this.$refs.weekTable.initBlock()
        }
      } else if (this.tabActivity == 2) {
        this.$refs.meetingRoom.hanldeAgainBlock()
      }
    },
    // 色块跳转url
    colorJumpUrl(item) {
      if (this.propData.handleColorJumpUrl && this.propData.handleColorJumpUrl.length > 0) {
        let name = this.propData.handleColorJumpUrl[0].name
        window[name] && window[name].call(this, {
          _this: this,
          item: item
        });
      } else {
        try {
          let url = IDM.url.getURLRoot() + item.url
          item.url && window.open(url)
        } catch(e) {
          console.log(e)
        }
      }
    },
    // 刷新周数据
    handleReWeekData() {
      this.handleRefreshTable()
    },
    // 日查看 切换星期 调用接口
    handleWeekTime() {
      this.datePicker = moment(this.selectWeack, "YYYY-MM-DD");
      if(this.typeActivity == 'day') {
        this.load = false
        setTimeout(() => {
          this.load = true
          this.initData(() => {
            this.$refs.roomDayTable.initTable(this.tableData)
          })
        }, 200)
      }
    },
    // 切换日期
    handleDatePicker(val) {
      if (!val) return
      this.selectWeack = val && val.format("YYYY-MM-DD")
      this.handleWeekTime()
      this.$nextTick(() => {
        this.$refs.weekTime.dayupdate()
      })
    },
    // 今天
    hanleToDay() {
      this.selectWeack = moment().format("YYYY-MM-DD");
      this.$nextTick(() => {
        this.$refs.weekTime.dayupdate()
      })
      this.handleWeekTime()
    },
    iframeUrl() {
      let url = ''
      if (this.propData.handleUrlFunc && this.propData.handleUrlFunc.length > 0) {
        let name = this.propData.handleUrlFunc[0].name
        url = window[name] && window[name].call(this, {
          _this: this
        });
      }
      return url
    },
    // 时间弹框 确定
    async handleSetTime() {
      let start, end = '';
      if (this.chooseTimeHourse.startTimeHourse && this.chooseTimeHourse.endTimeHourse) {
        start = this.chooseTimeHourse.startTimeHourse.format('HH:mm')
        end = this.chooseTimeHourse.endTimeHourse.format('HH:mm')
      } else {
        start = ''
        end = ''
      }
      await API.ApiSetTimeSetup(start, end)
      this.customTimeDialog = false
      this.handleRefreshTable()
    },
    // 刷新表格
    handleRefreshTable() {
      if (this.tabActivity == 1) {
        this.initData(() => {
          if(this.typeActivity == 'day') {
            this.$refs.roomDayTable.initTable(this.tableData)
          }
          if(this.typeActivity == 'week') {
            this.$refs.weekTable.initTable(this.weekListTable)
          }
        })
      } else if (this.tabActivity ==  2) {
        this.$refs.meetingRoom.handleRefresh()
      }
    },
    // 更多选项 清空
    handlePopClear() {
      this.searchListDic.regionList && this.searchListDic.regionList.forEach(item => item.show = false)
      this.searchListDic.siteTypeList && this.searchListDic.siteTypeList.forEach(item => item.show = false)
      this.searchListDic.capacityList && this.searchListDic.capacityList.forEach(item => item.show = false)
      this.searchListDic.freeTimeList && this.searchListDic.freeTimeList.forEach(item => item.show = false)
    },
    // 更多选项 确认
    handlePopSure() {
      this.mettingPopver = false
      this.handleRefreshTable()
    },
    // 更多选项
    handleSetSearch(item, val) {
      item.show = !item.show;
    },
    async requireDic() {
      let res = await API.ApiGetItemsByMetting()
      if (res.code == '200') {
        const data = res.data || {};
        this.searchListDic.regionList = data.region && data.region.map(item => Object.assign(item, {show: false}));
        this.searchListDic.siteTypeList = data.siteType && data.siteType.map(item => Object.assign(item, {show: false}));
        this.searchListDic.capacityList = data.capacity && data.capacity.map(item => Object.assign(item, {show: false}));
        this.searchListDic.freeTimeList = data.freeTime && data.freeTime.map(item => ({name: item, show: false}));
      }
      let time = await API.ApiGetMeetingRoom()
      if (time.code == '200') {
        const data = time.data || {};
        this.chooseTimeHourse.startTimeHourse = moment(data.startTime, 'HH:mm')
        this.chooseTimeHourse.endTimeHourse = moment(data.endTime, 'HH:mm')
      }
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
    },
    // 监听消息
    receiveBroadcastMessage(object) {
      switch(object.type) {
        case 'pageResize':
          this.handleAgainRenderBlock()
          break
      }
    },
    /**
     * @Desc 点击tab
     */
    handleTab(item) {
      if (item.value == this.tabActivity) return
      this.tabActivity = item.value
      this.loading = true;
      if (this.tabActivity == 1) {
        this.handleRefreshTable()
      } else if (this.tabActivity == 2) {
        this.initMeetingRoomData()
      } else{
        this.loading = false
      }
    },
    /**
     * @Desc 切换 日查看 周查看
     */
    handleType(item) {
      if (item.value == this.typeActivity) return
      this.typeActivity = item.value;
      this.$nextTick(() => {
        this.handleRefreshTable()
      })
    },
    /**
     * @Desc 设置样式
     */
     handleStyle() {
      let styleObject = {},
        nameObject = {};
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
            case 'maxHeight':
              styleObject['max-height'] = element;
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
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .imeetingapply", styleObject);
    },
    // 获取更多选项数据
    handleGetMoreData() {
      return {
        buildingType : this.searchListDic.regionList ? this.searchListDic.regionList.filter(item => item.show).map(item => item.id).join(',') : '',
        siteType: this.searchListDic.siteTypeList ? this.searchListDic.siteTypeList.filter(item => item.show).map(item => item.value).join(',') : '',
        rnrsValue: this.searchListDic.capacityList ? this.searchListDic.capacityList.filter(item => item.show).map(item => item.value).join(',') : '',
        freeTime: this.searchListDic.freeTimeList ? this.searchListDic.freeTimeList.filter(item => item.show).map(item => item.name).join(',') : '',
      }
    },
    // 按日期申请
    async initData(fn) {
      this.loading = true
      let { buildingType, siteType, rnrsValue, freeTime } = this.handleGetMoreData()
      if (this.typeActivity == 'day') { // 日查看
        let obj = {
          buildingType: buildingType, // 区域
          siteType: siteType, // 类型
          rnrsValue: rnrsValue, // 人数
          showTime: this.selectWeack,  // 时间
          freeTime: freeTime, // 空闲时间
          checkedIdle: this.search.checkdBox // 只查看当日空闲
        }
        let res = await API.ApiMeetingDayRoomList(obj)
        this.loading = false
        if(res.code == '200') {
          this.tableData = res.data;
          fn && fn()
        }
      } else if(this.typeActivity == 'week') { // 周查看
        let res = await API.ApiMeetingWeekRoomList({showStartDate: this.selectWeekObj.start, showEndDate: this.selectWeekObj.end})
        this.loading = false
        if (res.code == '200') {
          this.weekListTable = res.data
          fn && fn()
        }
      }
    },
    // 按会议室申请
    async initMeetingRoomData() {
      let res = await API.ApiMeetingRoomData()
      this.loading = false;
      if(res.code == '200') {
        let data = res.data || [];
        this.$refs.meetingRoom.initTable(data)
      }
    },
    init() {
      this.handleStyle()
      this.initData(() => {
        this.$refs.roomDayTable.initTable(this.tableData)
      })
    }
  }
}
</script>

<style lang="scss">
.meeting-popover{
  width: 350px;
  .ant-popover-inner-content{
    padding: 10px !important;
  }
  .meeting-popover-line{
    div{
      font-size: 16px;
      color: #333;
      margin-bottom: 10px;
    }
    span{
      display: inline-block;
      padding: 7px 17px;
      text-align: center;
      background-color: #FFFFFF;
      border: 1px solid rgba(230,230,230,1);
      border-radius: 6px;
      font-size: 14px;
      color: #999999;
      box-sizing: border-box;
      margin-right: 10px;
      margin-bottom: 10px;
      cursor: pointer;
    }
  }
  .select{
    background-color: #0080FF !important;
    color: #fff !important;
  }
  .metting-popover-center{
    text-align: center;
    margin-top: 10px;
    button+button{
      margin-left: 10px;
    }
  }
}
</style>

<style lang="scss" scoped>
.imeetingapply{
  .meeting-loading{
    position: absolute;
    top: 50%;
    left: 50%;
  }
  .imeetingiframe{
    width: 100%;
  }
  .mlr20{
    margin: 0 20px;
  }
  .mtl20{
    margin: 20px 0;
  }
  .mrt20{
    margin-right: 20px;
  }
  .date-right{
    ::v-deep .ant-input{
      color: #025FB2;
    }
  }
  .meeting-kong{
    margin-right: 20px;
    ::v-deep .ant-checkbox-inner{
      height: 20px;
      width: 20px;
    }
  }
  .meeting-tab{
    width: 100%;
    height: 50px;
    background-color: #FAFAFA;
    border: 1px solid #DDDDDD;
    display: flex;
    justify-content: space-between;
    .titleTop{
      display: flex;
      justify-content: space-between;
      align-items: center;
      span{
        font-family: PingFangSC-Medium;
        font-size: 18px;
        color: #666666;
        margin-right: 40px;
        letter-spacing: 0;
        line-height: 50px;
        cursor: pointer;
        border-bottom: 4px solid transparent;
      }
      .tabActivity{
        color: #025FB2;
        border-bottom: 4px solid #025FB2;
      }
    }
    .titleRight{
      display: flex;
      align-items: center;
      .title-day{
        border: 1px solid #dddddd;
        color: #333333;
        margin-right: 10px;
        border: 1px solid #dddddd;
        border-radius: 20px;
        height: 30px;
        span{
          line-height: 30px;
          min-width: 65px;
          display: inline-block;
          vertical-align: middle;
          font-size: 14px;
          transition: all 0.2s;
          cursor: pointer;
          text-align: center;
          transform: all 0.2s;
        }
        span:first-of-type{
          border-radius: 20px 0px 0px 20px;
        }
        span:last-of-type{
          border-radius: 0px 20px 20px 0px;
        }
        .typeActivity{
          background-color: #025FB2;
          color: #fff;
        }
      }
    }
  }
  .date-top{
    display: flex;
    justify-content: space-between;
    align-items: center;
    .date-left{
      display: flex;
      align-items: center;
      .moreColor{
        cursor: pointer;
        color: #0080ff;
      }
    }
  }
}
</style>
