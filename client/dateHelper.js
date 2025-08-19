exports.initialize = function (dateFunctions) {
  'use strict';
  const getYearShortMonthShortDay = function (dateString) {
      return dateFunctions.format(new Date(dateString), 'yyyy-MM-dd');
    },
    format = function (date, dateFormat) {
      return dateFunctions.format(date, dateFormat);
    },
    compareCurrentDateToChosenDate = function (chosenDateString, comparison) {
      const getCurrentDate = function () {
          const date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate();
          return new Date(year, month, day);
        },
        getChosenDate = function () {
          const regex = /^\d{4}-\d{2}-\d{2}$/,
            year = Number(chosenDateString.substring(0, 4)),
            month = Number(chosenDateString.substring(5, 7)) - 1,
            day = Number(chosenDateString.substring(8));
          if (!regex.test(chosenDateString)) {
            return new Date(chosenDateString);
          }
          return new Date(year, month, day);
        },
        currentDate = getCurrentDate(),
        chosenDate = getChosenDate();
      switch (comparison) {
        case 'before':{
          return isBefore(currentDate, chosenDate);
        }
        case 'after':{
          return isAfter(currentDate, chosenDate);
        }
        case 'equal':{
          return isEqual(currentDate, chosenDate);
        }
      }
    },
    isBefore = function (date, dateToCompare) {
      return dateFunctions.isBefore(date, dateToCompare);
    },
    isAfter = function (date, dateToCompare) {
      return dateFunctions.isAfter(date, dateToCompare);
    },
    isEqual = function (date, dateToCompare) {
      return dateFunctions.isEqual(date, dateToCompare);
    },
    getShortMonthShortDayYear = function (dateString) {
      return dateFunctions.format(new Date(dateString), 'MM-dd-yyyy');
    },
    getLongDayOfWeekLongMonthShortDayYear = function (dateString) {
      return dateFunctions.format(new Date(dateString), 'EEEE MMMM d, yyyy');
    },
    compareAscending = function (dateString1, dateString2) {
      return dateFunctions.compareAsc(new Date(dateString1), new Date(dateString2));
    },
    isFuture = function (date) {
      return dateFunctions.isFuture(date);
    },
    isPast = function (date) {
      return dateFunctions.isPast(date);
    },
    isLeapYear = function (year) {
      return (year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0);
    },
    adjustToLocalTimezone = function (date, wantNegative) {
      const hours = date.getTimezoneOffset() / 60;
      return dateFunctions.addHours(date, wantNegative ? -hours : hours);
    },
    getYearMonthArray = function (year, endMonth, monthsBack) {
      const yearMonths = [];
      let i, month;
      for (i = 0; i < monthsBack; i += 1) {
        month = endMonth - i;
        if (month > -1) {
          yearMonths.push({ year: year, month: month });
        } else {
          yearMonths.push({ year: year - 1, month: month + 12 });
        }
      }
      return yearMonths;
    },
    getMillisecondsInInterval = function (yearMonthArray) {
      const getMillisecondsInMonth = function (year, month) {
        const daysInMonth = getDaysInMonth(month, year);
        return daysInMonth * 24 * 60 * 60 * 1000;
      };
      let millisecondsInInterval = 0;
      yearMonthArray.forEach((x) => {
        const millisecondsInMonth = getMillisecondsInMonth(x.year, x.month);
        millisecondsInInterval += millisecondsInMonth;
      });
      return millisecondsInInterval;
    },
    getFromDate = function (endDate, monthsBack) {
      const year = endDate.getYear(),
        endMonth = endDate.getMonth(),
        yearMonthArray = getYearMonthArray(year, endMonth, monthsBack),
        millisecondsInInterval = getMillisecondsInInterval(yearMonthArray);
      return dateFunctions.subMilliseconds(endDate, millisecondsInInterval);
    },
    getDaysInMonth = function (month, year) {
      const thirtyDayMonthNumbers = [8, 3, 5, 10],
        monthNumber = Number(month);
      if (monthNumber === 1) {
        if (isLeapYear(year)) {
          return 29;
        }
        return 28;
      }
      if (thirtyDayMonthNumbers.includes(monthNumber)) {
        return 30;
      } else {
        return 31;
      }
    },
    today = () => {
      const now = new Date();
      return now.toISOString().split('T')[0];
    },
    yesterday = () => {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      return now.toISOString().split('T')[0];
    },
    isValidDate = function (date) {
      return date instanceof Date && !isNaN(date);
    },
    getDays = function (month, year) {
      const days = [];
      let i;
      for (i = 1; i <= getDaysInMonth(month, year); i++) {
        days.push(i);
      }
      return days;
    },
    getQuarterHours = function () {
      return ['00', '15', '30', '45'];
    },
    getDisplayMonth = function (date, wantLongMonthName) {
      const monthNumber = date.getMonth();
      switch (monthNumber) {
        case 0:
          return wantLongMonthName ? 'January' : 'Jan';
        case 1:
          return wantLongMonthName ? 'February' : 'Feb';
        case 2:
          return wantLongMonthName ? 'March' : 'Mar';
        case 3:
          return wantLongMonthName ? 'April' : 'Apr';
        case 4:
          return wantLongMonthName ? 'May' : 'May';
        case 5:
          return wantLongMonthName ? 'June' : 'Jun';
        case 6:
          return wantLongMonthName ? 'July' : 'Jul';
        case 7:
          return wantLongMonthName ? 'August' : 'Aug';
        case 8:
          return wantLongMonthName ? 'September' : 'Sep';
        case 9:
          return wantLongMonthName ? 'October' : 'Oct';
        case 10:
          return wantLongMonthName ? 'November' : 'Nov';
        case 11:
          return wantLongMonthName ? 'December' : 'Dec';
        default:
          return '';
      }
    },
    getDisplayDayNumber = function (date, wantLeadingZeros) {
      const dayNumber = date.getDate();
      return dayNumber < 10 && wantLeadingZeros ? '0' + dayNumber : dayNumber;
    },
    getDisplayMonthNumber = function (date, wantLeadingZeros) {
      const monthNumber = Number(date.getMonth() + 1);
      return monthNumber < 10 && wantLeadingZeros ? '0' + monthNumber : monthNumber;
    },
    getDisplayDay = function (date, wantLongDayName) {
      const dayNumber = date.getDay();
      switch (dayNumber) {
        case 0:
          return wantLongDayName ? 'Sunday' : 'Sun';
        case 1:
          return wantLongDayName ? 'Monday' : 'Mon';
        case 2:
          return wantLongDayName ? 'Tuesday' : 'Tue';
        case 3:
          return wantLongDayName ? 'Wednesday' : 'Wed';
        case 4:
          return wantLongDayName ? 'Thursday' : 'Thu';
        case 5:
          return wantLongDayName ? 'Friday' : 'Fri';
        case 6:
          return wantLongDayName ? 'Saturday' : 'Sat';
        default:
          return '';
      }
    },
    getMiltaryHour = function (hour, amPM) {
      const hourNumber = Number(hour);
      if (!amPM || !hour || hourNumber.isNaN) {
        return NaN;
      }
      if (amPM === 'AM') {
        if (hourNumber === 12) {
          return 0;
        } else {
          return hourNumber;
        }
      }
      if (amPM === 'PM') {
        if (hourNumber < 12) {
          return hourNumber + 12;
        } else {
          return hourNumber;
        }
      }
    },
    getDisplayDate = function (date, options) {
      const displayDay = getDisplayDay(date, options.wantLongDayName),
        displayMonth = getDisplayMonth(date, options.wantLongMonthName),
        displayDayNumber = getDisplayDayNumber(date, options.wantLeadingZerosInDayNumber),
        displayYear = date.getFullYear(),
        displayTime = getDisplayTimeFromMilitaryTime(date, options.wantLeadingZerosInMinutes, options.wantSeconds);
      return displayDay + ' ' + displayMonth + ' ' + displayDayNumber + ', ' + displayYear + ' ' + displayTime;
    },
    getDisplayTimeFromMilitaryTime = function (date, wantLeadingZerosInMinutes, wantSeconds) {
      let hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();
      if (minute < 10 && wantLeadingZerosInMinutes) {
        minute = '0' + minute;
      }
      if (second < 10) {
        second = '0' + second;
      }
      const displaySecond = wantSeconds ? ':' + second : '';
      if (hour === 0) {
        hour = 12;
        return hour + ':' + minute + displaySecond + ' AM';
      }
      if (hour > 0 && hour < 12) {
        return hour + ':' + minute + displaySecond + ' AM';
      }
      if (hour === 12) {
        return hour + ':' + minute + displaySecond + ' PM';
      }
      if (hour > 12) {
        hour = hour - 12;
        return hour + ':' + minute + displaySecond + ' PM';
      }
    },
    getYears = function (minYear) {
      const years = [],
        nextYear = new Date().getFullYear() + 1;
      let i;
      for (i = nextYear; i >= minYear; i -= 1) {
        years.push(i);
      }
      return years;
    },
    getFormattedDate = function (dateString, wantTime, wantYearFirst) {
      const date = new Date(dateString),
        month = getDisplayMonthNumber(date, true),
        day = getDisplayDayNumber(date, true),
        year = date.getFullYear(),
        formattedDate = wantYearFirst ? year + '-' + month + '-' + day : month + '-' + day + '-' + year;
      if (!wantTime) {
        return formattedDate;
      }
      let hour = date.getHours(),
        minutes = date.getMinutes();
      if (hour < 10) {
        hour = '0' + hour;
      }
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      return formattedDate + ' ' + hour + ':' + minutes;
    },
    getFormattedStartDate = function (eventStartDate, options) {
      const defaultOptions = {
        wantLongDayName: true,
        wantLongMonthName: false,
        wantLeadingZerosInDayNumber: false,
        wantLeadingZerosInMinutes: true,
        wantSeconds: false
      };
      options = options || defaultOptions;
      return getDisplayDate(eventStartDate, options);
    },
    getFormattedDateRange = function (eventStartDate, eventEndDate, options) {
      const defaultOptions = {
          wantLongDayName: false,
          wantLongMonthName: false,
          wantLeadingZerosInDayNumber: false,
          wantLeadingZerosInMinutes: true,
          wantSeconds: false
        },
        startDate = getDisplayDate(eventStartDate, options || defaultOptions),
        endDate = getDisplayDate(eventEndDate, options || defaultOptions);
      return startDate + ' to ' + endDate;
    },
    getCurrentDateString = function () {
      var today, date, time;
      today = new Date();
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
      return date + ' ' + time;
    };
  return {
    getQuarterHours: getQuarterHours,
    getMiltaryHour: getMiltaryHour,
    getDays: getDays,
    isLeapYear: isLeapYear,
    getYears: getYears,
    isValidDate: isValidDate,
    getFormattedDateRange: getFormattedDateRange,
    getFormattedStartDate: getFormattedStartDate,
    getFormattedDate: getFormattedDate,
    getCurrentDateString: getCurrentDateString,
    getLongDayOfWeekLongMonthShortDayYear: getLongDayOfWeekLongMonthShortDayYear,
    getYearShortMonthShortDay: getYearShortMonthShortDay,
    getShortMonthShortDayYear: getShortMonthShortDayYear,
    compareAscending: compareAscending,
    adjustToLocalTimezone: adjustToLocalTimezone,
    isFuture: isFuture,
    isPast: isPast,
    yesterday: yesterday,
    today: today,
    getFromDate: getFromDate,
    isBefore: isBefore,
    isAfter: isAfter,
    isEqual: isEqual,
    compareCurrentDateToChosenDate: compareCurrentDateToChosenDate,
    format: format
  };
};