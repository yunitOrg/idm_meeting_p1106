import { Modal } from 'ant-design-vue'
export default {
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        width: "60%",
        height: "100%",
        numRight: '10px',
        numTop: '33px',
        dataSourceType: 'datasource',
        numStyle: {
          fontSize: "14",
          fontSizeUnit: "px",
        },
        ulbox: {
          marginTopVal: "",
          marginRightVal: "",
          marginBottomVal: "",
          marginLeftVal: "",
          paddingTopVal: "1%",
          paddingRightVal: "2%",
          paddingBottomVal: "1%",
          paddingLeftVal: "2%"
        },
        printName: {
          fontColors: {
            hex: "#333333",
            hex8: "#333333"
          },
          fontSize: "36",
          fontSizeUnit: "px",
          fontLetterSpacing: 0,
          fontLetterSpacingUnit: "px"
        },
        articleBox: {
          marginTopVal: "",
          marginRightVal: "",
          marginBottomVal: "",
          marginLeftVal: "",
          paddingTopVal: "",
          paddingRightVal: "15px",
          paddingBottomVal: "",
          paddingLeftVal: "15px"
        },
        printQinum: {
          fontColors: {
            hex: "#333",
            hex8: "#333"
          },
          fontSize: "16",
          fontSizeUnit: "px",
        },
        printUnit: {
          fontColors: {
            hex: "#333",
            hex8: "#333"
          },
          fontSize: "16",
          fontSizeUnit: "px",
        },
        printColumn: {
          fontSize: "20",
          fontSizeUnit: "px",
        },
        articleTitle: {
          fontColors: {
            hex: "#333",
            hex8: "#333"
          },
          fontSize: "16",
          fontSizeUnit: "px",
        },
        articleStyle: {
          fontColors: {
            hex: "#333",
            hex8: "#333"
          },
          fontSize: "16",
          fontSizeUnit: "px",
        },
        articleUnitStyle: {
          fontColors: {
            hex: "#999",
            hex8: "#999"
          },
          fontSize: "14",
          fontSizeUnit: "px",
        }
      }
    }
  },
  methods: {
    /**
     * @Desc 拖拽开始
     */
    dragStart(env) {
      env.item.classList.add('columnborder')
    },
    /**
     * @Desc 拖拽结束
     */
    dragEnd(env) {
      env.item.classList.remove('columnborder')
      this.$nextTick(() => {
        this.printData?.columns.forEach((item,i) => {
          item.displaySequence = i+1
        })
        this.PrintSave()
      })
    },
    /**
     * @Desc 挂载到window上属性
     */
    windowMountAttribute() {
      window.iprintAction = {
        PrintGetData: this.PrintGetData, // 获取数据
        PrintIsShowColumn: this.PrintIsShowColumn, // 展开 收缩栏目
        PrintSave: this.PrintSave, // 保存数据
        PrintColumnDialog: this.PrintColumnDialog // 栏目排序弹框
      }
      try{
        top.initIframeContent(); // 调用dsf方法初始化
      } catch(e) {
        console.log(e)
      }
    },
    /**
     * @Desc 获取年份和期数
     */
    handleGetYearyQi() {
      let obj = {period: [], num: []}
      try{
        obj = top.getPeriodNum()
      } catch(e) {
        console.log(e)
      }
      return obj
    },
    /**
     * @Desc 获取数据
     */
    PrintGetData(obj) {
      this.loading = true
      this.printData = obj
      setTimeout(() => {
        this.loading = false
      }, 200);
      this.setData()
    },
    /**
     * @Desc 展开收缩 栏目和模块
     * @param {boolean} flag false: 收缩 true：展开
     */
    PrintIsShowColumn(flag) {
      this.printData?.columns.forEach(item => {
        item.isShow = flag;
        if (item.articles) {
          item.articles.forEach(k => {
            k.isShow = flag
          })
        }
      })
    },
    /**
     * @Desc 保存页面数据
     */
    PrintSave() {
      try{
        top.iframeContentSave(this.printData)
      } catch(e) {
        console.log('保存页面数据', e)
      }
    },
    /**
     * @Desc 栏目名称输入框失去焦点
     */
    handleColumnInput(item) {
      item.isColumnInput=true
      this.PrintSave()
    },
    /**
     * @Desc 弹框栏目排序
     */
    PrintColumnDialog() {
      this.printDataCopy = JSON.parse(JSON.stringify(this.printData))
      this.dialogObj.show = true
    },
    /**
     * @Desc 展开折叠栏目,展开折叠模块
     */
    handleColumnName(item) {
      item.isShow = !item.isShow
    },
    /**
     * @Desc 移动模块
     */
    handleMoveModule(item) {
      console.log(item)
    },
    /**
     * @Desc 鼠标右键菜单
     */
    showContentMenu(event, columnitem, moduleitem, moduleIndex) {
      if (!this.isEdit) return
      event.preventDefault()
      this.menuObj.x = event.offsetX
      this.menuObj.y = event.pageY - event.offsetY - 70
      this.menuObj.show = true
      this.oprateObj.columnitem = columnitem
      this.oprateObj.moduleitem = moduleitem
      this.oprateObj.moduleIndex = moduleIndex
    },
    handleProtoFunc(funcname, obj) {
      if (this.propData[funcname] && this.propData[funcname].length > 0) {
        let name = this.propData[funcname][0].name
        this.isEdit = window[name] && window[name].call(this, {
          _this: this,
          item: obj
        });
      }
    },
    /**
     * @Desc 鼠标右键菜单点击
     */
    handleMenu(item) {
      let that = this
      switch(item.id) {
        case 'see':{
          try{
            top.viewSourceFile(this.oprateObj.moduleitem)
          } catch(e) {
            console.log('保存页面数据', e)
          }
          this.handleProtoFunc('handleSeeArticle', this.oprateObj)
        }
          break
        case 'add':{
          try{
            top.addContentFile(this.oprateObj.moduleitem)
          } catch(e) {
            console.log('保存页面数据', e)
          }
          this.handleProtoFunc('handleAddArticle', this.oprateObj)
        }
          break
        case 'delete':{
          Modal.confirm({
            title: "是否删除该文本？",
            cancelText: '取消',
            okText: '确定',
            onOk() {
              that.oprateObj.columnitem.articles.splice(that.oprateObj.moduleIndex, 1);
              that.PrintSave()
              try{
                top.removeContentFile(that.oprateObj.moduleitem)
              } catch(e) {
                console.log('保存页面数据', e)
              }
              that.handleProtoFunc('handleDeleteArticle', that.oprateObj)
            },
            onCancel() {
              console.log('cancel')
            },
          })
        }
          break
        case 'move':{
          try{
            top.moveContentFile(this.oprateObj.moduleitem)
          } catch(e) {
            console.log('保存页面数据', e)
          }
          this.handleProtoFunc('handleMoveArticle', this.oprateObj)
        }
          break
      }
      this.menuObj.show = false
    },
    hideMenu() {
      this.menuObj.show = false
    },
    /**
     * @Desc 编辑栏目名称
     */
    editColumnName(item) {
      item.isColumnInput = false;
      this.$nextTick(() => {
        this.$refs.columnInput[0].$el.focus()
      })
    },
    /**
     * @Desc 删除栏目
     */
    delteColumn(index) {
      let that = this
      Modal.confirm({
        title: "删除栏目后，会移除该栏目下所有稿件，是否删除？",
        cancelText: '取消',
        okText: '确定',
        onOk() {
          that.printData.columns.splice(index, 1)
          that.PrintSave()
        },
        onCancel() {
          console.log('cancel')
        },
      })
    },
    /**
     * @Desc 栏目排序弹框
     */
    handleDialogOk() {
      this.dialogObj.confirmLoading = true
      this.dialogObj.show = false
      this.$nextTick(() => {
        this.dialogObj.confirmLoading = false
        this.printDataCopy?.columns.forEach((item,i) => {
          item.displaySequence = i+1
        })
        this.printData = JSON.parse(JSON.stringify(this.printDataCopy))
        this.PrintSave()
      })
    },
    /**
     * @Desc 编辑
     */
    handleEdit(e, item) {
      if (item) {
        item.editState = false
      } else {
        this.editState = false
      }
      let dom = this.$refs.iprintaction
      this.editStateBtn.x = dom.offsetWidth+10
      this.editStateBtn.y = e.pageY+10
      this.editStateBtn.show = true
    },
    /**
     * @Desc 保存按钮
     */
    handleSveState() {
      this.editState = true
      this.printData?.columns.forEach(item => {
        if (item.articles) {
          item.articles.forEach(k => {
            k.editState = true
          })
        }
      })
      this.editStateBtn.show = false
      this.PrintSave()
    },
    /**
     * @Desc 设置主题
     */
    ThemeListAttrToStyle() {
      var themeList = this.themeList;
      if (!themeList) {
          return
      }
      const themeNamePrefix =
          IDM.setting && IDM.setting.applications && IDM.setting.applications.themeNamePrefix
              ? IDM.setting.applications.themeNamePrefix
              : 'idm-theme-'
      for (var i = 0; i < themeList.length; i++) {
        var item = themeList[i]
        let bulletBgColorObj = {
            'color': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''
        }
        let timeDateStyle = {
          'border-bottom-color': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) + '!important' : ''
        }
        IDM.setStyleToPageHead(`.${themeNamePrefix}${item.key} .iprintaction .column-li .column-name`, bulletBgColorObj)
        IDM.setStyleToPageHead(`.${themeNamePrefix}${item.key} .iprintaction .column-li .column-name`, timeDateStyle)
        IDM.setStyleToPageHead(`.${themeNamePrefix}${item.key} .iprintaction .print-num`, bulletBgColorObj)
        // IDM.setStyleToPageHead(`.${themeNamePrefix}${item.key} .printAction .ant-modal-title`, bulletBgColorObj)
      }
    }
  }
}