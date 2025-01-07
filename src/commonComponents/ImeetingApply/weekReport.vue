<template>
  <div class="weekReport">
    <!-- 上移 -->
    <div
      class="weektime-arrow"
      @click="toggleHandle('left')"
    >
      <svg-icon iconClass="rectangle_left"></svg-icon>
    </div>
    <div class="weektime-container">
      <a-select v-model="search.year" :default-value="search.year" class="mr10" style="width:100px" @change="handleSetTime('year')">
        <a-select-option :value="year.value" v-for="(year, index) in yearList" :key="index">
          {{ year.text }}
        </a-select-option>
      </a-select>
      <a-select v-model="search.week" :default-value="search.week" class="mr10" style="width:200px" @change="handleSetTime('month')">
        <a-select-option :value="item.index" v-for="(item, index) in weekList" :key="index">
          {{ item.week }} ({{ item.weekStag }})
        </a-select-option>
      </a-select>
      <a-button @click="handleToWeek">本周</a-button>
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
// 获取年
const weekYear = function(year) {
  let currentDate = year+1;
  let yearAry = [];
  for(let i=0; i<5; i++) {
    yearAry.push({
      text: `${currentDate}年`,
      value: currentDate,
      check: currentDate == year
    });
    currentDate = Number(currentDate) - 1;
  }
  return yearAry;
}
// 获取年的所有周
const getAllWeekOfYear = function(year) {
  let currentMoment = moment([year]).startOf('year'); // 本年第一天
  let weeks = [];
  let i = 1;
  while (currentMoment.isBefore(moment([year]).endOf('year'))) {
    let weekStart = currentMoment.clone().startOf('isoWeek'); // 周的开始日期
    let weekEnd = currentMoment.clone().endOf('isoWeek'); // 周的结束日期
    // if (weekEnd.format('YYYY') != year) {
    //   break
    // }
    weeks.push({
      index: i,
      week: `第${i}周`,
      weekStag: `${weekStart.format('M.D')}~${weekEnd.format('M.D')}`,
      start: weekStart.format('MM-DD'),
      end: weekEnd.format('MM-DD'),
      check:  moment(moment().format("YYYY-MM-DD")).isBetween(moment(weekStart.format('YYYY-MM-DD')), moment(weekEnd.format('YYYY-MM-DD')), null, '[]')
    });
    i = i+1;
    currentMoment.add(1, 'weeks'); // 移动到下一周
  }
  return weeks;
}
export default {
  data() {
    return {
      search: {
        year: '',
        week: ''
      },
      yearList: weekYear(new Date().getFullYear()),
      weekList: getAllWeekOfYear(new Date().getFullYear())
    }
  },
  mounted() {
    this.search.year = new Date().getFullYear();
    this.search.week = (this.weekList.find(k=>k.check) || {}).index
    this.emitValue()
  },
  methods: {
    emitValue(flag) {
      let week = this.search.week
      let chooseWeek = this.weekList[week-1]
      let obj = {
        start: this.search.year +'-'+ chooseWeek.start,
        end: this.search.year +'-'+ chooseWeek.end
      }
      if (week == 1) {
        if (moment(`${this.search.year}-${chooseWeek.start}`, "YYYY-MM-DD").isAfter(moment(`${this.search.year}-${chooseWeek.end}`, "YYYY-MM-DD"))) {
          obj.start = this.search.year - 1 + "-" + chooseWeek.start
        }
      }
      if (week == this.weekList.length) {
        if (moment(`${this.search.year}-${chooseWeek.start}`, "YYYY-MM-DD").isAfter(moment(`${this.search.year}-${chooseWeek.end}`, "YYYY-MM-DD"))) {
          obj.end = this.search.year + 1 + "-" + chooseWeek.end
        }
      }
      this.$emit('update:value', obj)
    },
    handleSetTime(type) {
      if(type == 'year') {
        this.yearList = weekYear(this.search.year);
        this.weekList = getAllWeekOfYear(this.search.year)
        this.search.week = 1
      }
      this.emitValue('flag')
      this.$emit('handleRefresh')
    },
    // 计算年 周
    handleCurrentTime() {
      this.yearList = weekYear(this.search.year);
      this.weekList = getAllWeekOfYear(this.search.year)
    },
    // 切换周
    toggleHandle(type) {
      let len = this.weekList.length
      if(type == 'right') {
        if(this.search.week<len) {
          this.search.week = Number(this.search.week)+ 1
          this.emitValue()
        } else {
          this.search.year = Number(this.search.year)+ 1
          this.handleCurrentTime()
          this.search.week = 1
          this.emitValue(type)
        }
      } else {
        if (this.search.week > 1) {
          this.search.week = Number(this.search.week - 1)
          this.emitValue()
        } else {
          this.search.year = Number(this.search.year)- 1
          this.handleCurrentTime()
          this.search.week = this.weekList.length
          this.emitValue(type)
        }
      }
      this.$emit('handleRefresh')
    },
    // 本周
    handleToWeek() {
      this.yearList = weekYear(new Date().getFullYear());
      this.search.year = new Date().getFullYear();

      this.weekList = getAllWeekOfYear(new Date().getFullYear())
      let first_monday = moment().subtract(moment().format('E') - 1, 'days').format("MM-DD")
      let chooseWeekObj = this.weekList.find(item => item.start == first_monday)
      this.search.week = chooseWeekObj.index
      this.emitValue()
      this.$emit('handleRefresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.weekReport{
  display: flex;
  .mr10{
    margin-right: 10px;
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
    ::v-deep .ant-select-selection__rendered{
      color: #025FB2;
    }
  }
}
</style>
