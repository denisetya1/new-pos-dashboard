export const formatCurrency = (
  num: number | undefined | null
) => {
  if(num === undefined || num === null){
    num = 0
  }

  let idr = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  });

  return idr.format(num)
}

export const isEmptyVal= (value: any, includeZero?: boolean) => {
  if(value === '' || value === undefined || value === null || (includeZero === true && value === 0)){
    return true
  }

  return false
}

export const sortByKey = (arr: Array<any>, key: string, sort: string) => {
  if(sort === 'asc'){
    arr.sort(function(a, b){return a[key] - b[key]});
  } else {
    arr.sort(function(a, b){return b[key] - a[key]});
  }

  return arr
}

export const roundNearest500 = (num: Number) => {
  return Math.round(Number(num) / 500) * 500;
}

export const getFinalPrice = (price : Number, markup: Number | null, discount: Number | null, rounded: boolean = false, formatted: boolean = false) => {
  if(markup === null)
    markup = 0
  if(discount === null)
    discount = 0

  let finalPrice = ((Number(price)* (1+ Number(markup)/100)) * (1-Number(discount)/100))

  if(rounded) {
    finalPrice = roundNearest500(finalPrice)
  }

  if(formatted)
    return formatCurrency(finalPrice)
  else 
    return finalPrice
}

export const dateUTC = (dateString: string) => {
  const date = new Date(dateString)
  
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}