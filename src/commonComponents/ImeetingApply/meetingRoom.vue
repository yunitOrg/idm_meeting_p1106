<template>
  <div class="meetingroom">
    <div class="meetingroom-floor">
      <div class="room-left meetingflex">
        <!-- 上移 -->
        <div
          class="weektime-arrow"
          :class="{'disabled': currentPNum == 0}"
          @click="toggleHandle('left')"
        >
          <svg-icon iconClass="rectangle_left"></svg-icon>
        </div>
        <div ref="roomLeft" class="weektime-container">
          <div ref="weektimelist" class="weektime-list">
            <li
              v-for="(room, i) in roomSwiper[currentPNum]"
              :key="i"
              :class="selectRoom.roomId == room.roomId && 'roomactive'"
              @click="handleClick(room)">{{ room.roomName }}</li>
          </div>
          <div class="weekdot">
            <span v-for="(dot, dotindex) in roomSwiper" :class="currentPNum==dotindex&&'dotactive'" :key="dotindex" @click="handleDot(dotindex)"></span>
          </div>
        </div>
        <!-- 下移 -->
        <div
          class="weektime-arrow"
          :class="{'disabled': currentPNum == roomSwiper.length-1}"
          @click="toggleHandle('right')"
        >
          <svg-icon iconClass="rectangle_right"></svg-icon>
        </div>
      </div>
      <div class="room-right">
        <div class="room-info-left">
          <div class="room-info-title">{{ selectRoom.roomName }}</div>
          <div class="mrb10">可用面积：{{ selectRoom.area }}</div>
          <div class="mrb10">容纳人数：{{ selectRoom.capacity }}</div>
          <div class="mrb10 desc">可用资源：{{ selectRoom.roomResourceText }}</div>
          <div class="desc" :title="selectRoom.mainUses">主要用途：{{ selectRoom.mainUses }}</div>
          <div class="metdesc" v-html="handleMeetingRoomHtml()"></div>
        </div>
        <div class="room-info-right">
          <img :src="getImageUrl(selectRoom.roomPhoto)" alt="" />
        </div>
      </div>
    </div>
    <div class="textalign">
      <weekReport :value.sync="selectTime" @handleRefresh="handleRefresh"></weekReport>
    </div>
    <div>
      <meetingTable :propData="propData" ref="meetingTable" :moduleObject="moduleObject" @colorJumpUrl="colorJumpUrl"></meetingTable>
    </div>
  </div>
</template>

<script>
import weekReport from './weekReport.vue';
import meetingTable from './meetingTable.vue';
import API from '../../api/meeting.js';
export default {
  components: {
    weekReport,
    meetingTable
  },
  props: {
    propData: {
      type: Object
    },
    moduleObject: {
      type: Object
    }
  },
  data() {
    return {
      // 选择周期
      selectTime: {
        start: '',
        end: ''
      },
      currentPNum: 0,
      roomData: [],
      // 轮播图
      roomSwiper: [],
      // 选中会议室
      selectRoom: {
        roomPhoto: ""
      }
    }
  },
  methods: {
    getImageUrl(url) {
      if (url) {
        return IDM.url.getWebPath(url)
      } else {
        return IDM.url.getModuleAssetsWebPath(require(`../../assets/default.jpg`), this.moduleObject)
      }
    },
    handleMeetingRoomHtml() {
      let html = ''
      if (this.propData.handleMeetingRoomDetail && this.propData.handleMeetingRoomDetail.length > 0) {
        let name = this.propData.handleMeetingRoomDetail[0].name
        html = window[name] && window[name].call(this, {
          _this: this,
          data: this.selectRoom
        });
      }
      return html
    },
    // 色块跳转
    colorJumpUrl(item) {
      this.$emit('colorJumpUrl', item)
    },
    handleClick(room) {
      this.selectRoom = room;
      this.handleRefresh()
    },
    handleDot(dotindex) {
      this.currentPNum = dotindex;
      this.selectRoom = this.roomSwiper[this.currentPNum][0]
      this.handleRefresh()
    },
    // 会议室上、下
    toggleHandle(type) {
      if (type == 'right') {
        if (this.currentPNum<this.roomSwiper.length-1) {
          this.currentPNum++
          this.selectRoom = this.roomSwiper[this.currentPNum][0]
        }
      } else {
        if (this.currentPNum>0) {
          this.currentPNum--
          this.selectRoom = this.roomSwiper[this.currentPNum][0]
        }
      }
      this.handleRefresh()
    },
    // 刷新表格
    handleRefresh() {
      this.getTableData()
    },
    // 重新渲染色块
    hanldeAgainBlock() {
      this.$refs.meetingTable.initBlock()
    },
    // 获取table
    async getTableData() {
      let res = await API.ApiMeetingInfoRoom({ showStartDate: this.selectTime.start, showEndDate: this.selectTime.end, roomId: this.selectRoom.roomId })
      if (res.code == '200') {
        this.$refs.meetingTable.initTable(res.data, this.selectRoom)
      }
    },
    handleSplitNum(ary, num) {
      let result = []
      for (let i=0; i<ary.length;i+=num) {
        result.push(ary.slice(i, i+num))
      }
      return result
    },
    // 计算轮播图
    computedSwiper() {
      let ref = this.$refs.roomLeft;
      let leftAllWidth = ref.offsetWidth;
      let split = Math.floor(leftAllWidth/280) * 2 // 一行显示个数
      let resultAry = this.handleSplitNum(this.roomData, split)
      this.roomSwiper = resultAry
    },
    // data：会议室信息
    initTable(data) {
      this.roomData = data
      data && (this.selectRoom = this.roomData[0])
      this.computedSwiper()
      this.getTableData()
    }
  }
}
</script>

<style lang="scss" scoped>
.meetingroom{
  .textalign{
    margin: 20px 0 10px;
    display: flex;
    justify-content: center;
  }
  .disabled{
    cursor: not-allowed !important;
    svg{
      color: #ccc;
      fill: #ccc;
    }
  }
  li, ul{
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .meetingflex{
    display: flex;
    align-items: center;
    // justify-content: center;
  }
  .meetingroom-floor{
    display: flex;
    .weektime-container{
      display: flex;
      flex-wrap: wrap;
      // justify-content: center;
      overflow: hidden;
      height: 220px;
      flex: 1;
    }
    .weektime-list{
      position: relative;
      width: 100%;
      height: calc(100% - 20px);
      display: flex;
      left: 0;
      flex-wrap: wrap;
      ul{
        display: flex;
        flex-wrap: wrap;
        width: 100%;
      }
    }
    .weekdot{
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 5px;
      span{
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #ddd;
        cursor: pointer;
      }
      span+span{
        margin-left: 15px;
      }
      .dotactive{
        background-color: #0F549D;
      }
    }
    .weektime-container{
      li{
        width: 240px;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: #333;
        margin: 0 20px 20px 20px;
        background: url('../../assets/hydd1.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        cursor: pointer;
      }
      .roomactive{
        color: #fff;
        background: url('../../assets/hydd2.png');
      }
    }
  }
  .mtb10{
    margin: 10px 0; 
  }
  .mrb10{
    margin-bottom: 10px;
    line-height: 22px;
  }
  .weektime-arrow{
    color: #0080ff;
    width: 40px;
    flex-shrink: 0;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .room-left{
    width: calc(100% - 710px);
    margin-top: 30px;
    // padding-right: 20px;
    border-right: 1px solid #eeeeee;
  }
  .room-right{
    width: 710px;
    height: 210px;
    padding-left: 30px;
    padding-top: 40px;
    box-sizing: border-box;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    .room-info-left{
      font-family: PingFangSC-Regular;
      font-size: 16px;
      color: #333;
      letter-spacing: 0;
      margin-right: 20px;
      width: 330px;
      height: 210px;
      display: inline-block;
      .desc{
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .metdesc{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .room-info-title{
      font-size: 18px;
      margin-bottom: 10px;
    }
    .room-info-right{
      display: inline-block;
      height: 210px;
      width: 330px;
    }
    .room-info-right img{
      width: 330px;
      height: 100%;
    }
  }
}
</style>
