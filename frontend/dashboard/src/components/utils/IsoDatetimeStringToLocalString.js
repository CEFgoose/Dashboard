export default function IsoDatetimeStringToLocalString(datetimeString) {
    // idk why date-fns made this so freaking difficult, but native Date seems to work fine
    if (datetimeString) {
      const date = new Date(datetimeString);
      return date.toLocaleString();
    }
    return datetimeString;
}  