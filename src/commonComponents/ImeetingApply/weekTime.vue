<template>
  <div class="weektime">
    <!-- 上移 -->
    <div
      class="weektime-arrow"
      @click="toggleHandle('left')"
    >
      <svg-icon iconClass="rectangle_left"></svg-icon>
    </div>
    <div class="weektime-container">
      <div ref="calendarList" class="weektime-list">
        <ul class="weektime-ul" v-for="(weak, w) in weekList" :key="w">
          <li v-for="(day, d) in weak" :key="d"
            @click="dayClickHandle(day)"
            :class="{
              select: value == day.date,
              today: day.today,
              holiday: day.leaveType === '3' || day.leaveType === '-1'
            }"
          >
            <span class="day-weekcn">星期{{ weekCn[d] }}</span>
            <span>{{ day.date }}</span>
          </li>
        </ul>
      </div>
    </div>
    <!-- 下移 -->
    <div
      class="weektime-arrow"
      @click="toggleHandle('right')"
    >
      <svg-icon iconClass="rectangle_right"></svg-icon>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  props: ['value'],
  data() {
    return {
      weekStart: moment().startOf("isoWeek"),
      weekList: [],
      weekCn: ["一", "二", "三", "四", "五", "六", "日"],
    }
  },
  mounted() {
    this.initWeeklist();
  },
  methods: {
    /**
     * 选中日期更新
     */
    dayupdate() {
      if (this.weekList[1].filter(item => item.date == this.value).length == 0) {
        let date = moment(this.value)
        let dow = date.day()
        this.weekStart = date.subtract(dow-1, 'days')
        this.computedWeek()
      }
    },
    /**
     * 点击某天
     */
    dayClickHandle(day) {
      this.value = day.date
      this.changeValue()
    },
    changeValue() {
      this.$emit('update:value', this.value)
      this.$emit('change')
    },
    /**
   * 切换周
   */
    toggleHandle(type) {
      const calendarList = this.$refs.calendarList;
      calendarList.style.transition = ".5s";
      let number = 0;
      if (type == 'right') {
        calendarList.style.left = "-1400px";
        number = -7;
      } else {
        calendarList.style.left = "0px";
        number = 7;
      }
      this.weekStart.subtract(number, "days");
      this.value = moment(this.value,"YYYY-MM-DD").subtract(number, "days").format("YYYY-MM-DD");
      this.changeValue()
      this.$nextTick(() => {
        setTimeout(() => {
          calendarList.style.transition = "none";
          calendarList.style.left = "-700px";
        }, 500);
        // 更新周数据
        let days = [];
        let newWeekStart = null;
        if (type === "right") {
          this.weekList.shift();
          newWeekStart = this.weekStart.clone().subtract(-7, "days");
        } else {
          this.weekList.pop();
          newWeekStart = this.weekStart.clone().subtract(7, "days");
        }
        for (var i = 0; i <= 6; i++) {
          const day = moment(newWeekStart).add(i, "days");
          days.push({
            date: day.format("YYYY-MM-DD"),
            today: moment().format("YYYY-MM-DD") === day.format("YYYY-MM-DD"),
            leaveType: i >= 5 ? '3' :'1'
          });
        }
        if (type === "right") {
          this.weekList.push(days)
        } else {
          this.weekList.unshift(days)
        }
      })
    },
    computedWeek() {
      const preWeekStart = this.weekStart.clone().subtract(7, "days");
      const weekStart = this.weekStart.clone();
      const nexWeektStart = this.weekStart.clone().subtract(-7, "days");
      const weekList = [preWeekStart, weekStart, nexWeektStart];
      this.weekList = [];
      weekList.forEach((item) => {
        var days = [];
        for (var i = 0; i <= 6; i++) {
          const day = moment(item).add(i, "days");
          days.push({
            date: day.format("YYYY-MM-DD"),
            today: moment().format("YYYY-MM-DD") === day.format("YYYY-MM-DD"),
            leaveType: i >= 5 ? '3' :'1'
          });
        }
        this.weekList.push(days);
      });
    },
    initWeeklist() {
      this.weekStart = moment(this.value).clone().startOf('isoWeek')
      this.computedWeek()
    }
  }
}
</script>

<style lang="scss" scoped>
.weektime{
  display: flex;
  margin-right: 30px;
  ul, li{
    list-style: none;
    margin: 0;
    padding: 0;
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
  .weektime-container{
    width: 700px;
    display: flex;
    overflow: hidden;
    border: 1px solid #dddddd;
    .weektime-list{
      position: relative;
      width: 100%;
      display: flex;
      left: -700px;
    }
    .weektime-ul{
      display: flex;
      li{
        width: 100px;
        height: 80px;
        text-align: center;
        font-weight: 500px;
        font-size: 14px;
        border-left-color: #eeeeee;
        border-right: 1px solid #eeeeee;
        display: flex;
        flex-direction: column;
        justify-content: center;
        cursor: pointer;
        &:last-child {
          border-right: none;
        }
        &.holiday {
          color: #EC4519;
        }
        &.today {
          color:#0080ff;
        }
        &.select {
          color: #fff;
          background-color: #0080ff;
        }
        .day-weekcn {
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>
