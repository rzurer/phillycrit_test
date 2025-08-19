exports.initialize = function (eventListener, ajaxHelper, htmlHelper, sortHelper) {
  'use strict';
  const createAudit = function (email, action, critDate) {
      ajaxHelper.post('/admin/audit', { email: email, action: action, critDate: critDate, device: htmlHelper.getDeviceType() });
    },
    getAllAudits = function (callback, fromDateString) {
      const fromTime = fromDateString ? new Date(fromDateString).getTime() : '';
      ajaxHelper.get('admin/recentAudits', function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        const audits = response.payload;
        if (fromTime) {
          const auditsAfter = audits.filter((a) => {
            const auditTime = new Date(a.createDate).getTime();
            return auditTime >= fromTime;
          });
          auditsAfter.sort((a, b) => sortHelper.dateSort(a, b, 'createDate', true));
          callback(auditsAfter);
          return;
        }
        audits.sort((a, b) => sortHelper.dateSort(a, b, 'createDate', true));
        callback(audits);
      });
    },
    updateAudit = function (audit) {
      ajaxHelper.put('admin/audit', { audit: audit }, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
        }
      });
    };
  return {
    createAudit: createAudit,
    getAllAudits: getAllAudits,
    updateAudit: updateAudit
  };
};