import moment from "moment";
export default {
  data() {
    return {
      visible: false,
      confirmLoading: false,
      radioAry: [],
      orgId: '',
      jumpParams: {},
      // 滑块开始
      mouseFlag: false,
      // 滑块总和
      mouseChooseAry: [],
      // 滑动开始时间
      chooseStart: {
        startX: '',
        startY: ''
      },
      // 滑动结束x/y/room
      chooseTime: {
        start: '',
        end: '',
        room: {}
      },
    }
  },
  methods: {
    // 提示内容锁
    handleColorTipsLockContent(item) {
      if (this.propData.handleTipsContentLockFunc && this.propData.handleTipsContentLockFunc.length > 0) {
        let name = this.propData.handleTipsContentLockFunc[0].name
        return window[name] && window[name].call(this, {
          _this: this,
          item: item
        });
      } else {
        return `<div>
            <p>锁定时间：${ item.satrtTime }-${ item.endTime }</p>
            <p>锁定类型：${ item.lockTypeText }</p>
            <p>锁定原因：${ item.lockReason }</p>
          </div>`
      }
    },
    // 提示内容
    handleColorTipsContent(item) {
      if (this.propData.handleTipsContentFunc && this.propData.handleTipsContentFunc.length > 0) {
        let name = this.propData.handleTipsContentFunc[0].name
        return window[name] && window[name].call(this, {
          _this: this,
          item: item
        });
      } else {
        return `<div>
            <p>申请部门：${ item.ngbm }</p>
            <p>联系人：${ item.ngr }</p>
            <p>联系电话：${ item.mobile }</p>
          </div>`
      }
    },
    handleTrMouseEnter() {
      this.mouseFlag = false
    },
    // 清除 选中块
    claerMouseClass() {
      if (this.mouseChooseAry.length > 0) {
        this.mouseChooseAry.forEach(item => {
          item.classList.remove('mouse')
        })
      }
    },
    // 鼠标点击
    handleTrMouseDown(e, room) {
      this.chooseTime.start = '';
      this.chooseTime.end = '';
      this.chooseTime.room = {};
      this.claerMouseClass()
      this.mouseChooseAry = []
      this.mouseFlag = true
      this.mouseupFlag = false;
      let start = e.target.getAttribute('start');
      let end = e.target.getAttribute('end');
      this.chooseTime.room = room
      if(this.showTips({start, end})) {
        return
      }
      this.chooseStart.startX = start
      this.chooseStart.startY = end
      if (!this.mouseChooseAry.includes(e.target)) {
        this.mouseChooseAry.push(e.target)
      }
      e.target.classList.add('mouse')
    },
    // 鼠标移动
    handleTrMouseMove(e) {
      if (this.mouseFlag) {
        this.mouseupFlag = true;
        let start = e.target.getAttribute('start');
        let end = e.target.getAttribute('end');
        if (this.showTips({start, end})) {
          return
        }
        if (!this.mouseChooseAry.includes(e.target)) {
          this.mouseChooseAry.push(e.target)
        }
        let { resultX, resultY } = this.handleSiteCell({startX: this.chooseStart.startX, startY: this.chooseStart.startY, endX: start, endY: end, target: e.target})
        this.chooseTime.start = resultX
        this.chooseTime.end = resultY
      }
    },
    // 鼠标抬起
    handleTrMouseUp(e) {
      if (this.chooseTime.start) {
        this.handleClickTdMouse(this.chooseTime.room, this.chooseTime)
      }
      this.mouseFlag = false;
    },
    handleCell(obj) {
      let {startX, endX} = obj
      let momentStartX = moment(startX),
        momentEndx = moment(endX);
      this.mouseChooseAry.forEach(item => {
        let targetStart = item.getAttribute('start'),
          targetMomentStart = moment(targetStart);
        let x = targetMomentStart.isAfter(momentStartX) || targetMomentStart.isSame(momentStartX),
          y = targetMomentStart.isBefore(momentEndx) || targetMomentStart.isSame(momentEndx);
        if (x && y) {
          item.classList.add('mouse')
        } else {
          item.classList.remove('mouse')
        }
      })
    },
    handleSiteCell(obj) {
      let { startX, startY, endX, endY, target } = obj
      let momentStartX = moment(startX),
        momentEndx = moment(endX),
        resultX = '',
        resultY = '';
      if (momentStartX.isSame(momentEndx)) { // 同一个
        this.claerMouseClass()
        target.classList.add('mouse')
        resultX = startX
        resultY = endY
      }
      if (momentStartX.isBefore(momentEndx)) { // 向右
        this.handleCell({startX: startX, endX: endX})
        resultX = startX
        resultY = endY
      }
      if (momentStartX.isAfter(momentEndx)) { // 向左
        this.handleCell({startX: endX, endX: startX})
        resultX = endX
        resultY = startY
      }
      return {
        resultX: resultX,
        resultY: resultY
      }
    }
  }
}