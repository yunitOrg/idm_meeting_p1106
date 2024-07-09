export default {
    // 获取系统配置
    handleGetSystemSetting(key) {
        return IDM.http.getSync('/ctrl/idm/form/getSysConfigInfo', { key })
    },
    /**
   * @Desc 会议周查询-会议
   */
  async ApiWeekRoomList({showStartDate, showEndDate}) {
    let formdata = new FormData();
    formdata.append('showStartDate', showStartDate)
    formdata.append('showEndDate', showEndDate)
    const { data } = await window.IDM.http.post('ctrl/meetingPortal/queryWeekMeetingInfoByMeetingRoom', formdata, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    })
    return data
  },
  /**
   * @Desc 山东中烟-会议管理
   */
  async ApiMeeting({startTime, endTime}) {
    let formdata = new FormData();
    formdata.append('buildingType', '')
    formdata.append('siteType', '')
    formdata.append('rnrsValue', '')
    formdata.append('startTime', startTime)
    formdata.append('endTime', endTime)
    formdata.append('freeTime', '')
    formdata.append('checkedIdle', false)
    const { data } = await window.IDM.http.post('ctrl/meetingPortal/getDayUsageInfoByMeetingRoom', formdata, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    })
    return data
  },
}