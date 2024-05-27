async function fetchData1(params) {
  try {
    console.log(params);
  
    // params = 'ar';
    // const url = 'https://hadeethenc.com/api/v1/hadeeths/one/?language=en&id=2962';
    const url = `https://hadeethenc.com/api/v1/hadeeths/list/?language=en&category_id=11&page=1&per_page=200`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data;
    // console.log(arr);
  } catch (err) {
      console.log(err);
  }
}
// console.log(lang);
var arr = await fetchData1();
export    { arr};
// console.log('hello');