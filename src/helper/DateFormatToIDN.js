

const DateFormatToIDN = (date) => {
    return date?.split('-').reverse().join('-') 
}

export default DateFormatToIDN