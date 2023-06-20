import { sleep, check } from 'k6'
import http from 'k6/http'

// See https://k6.io/docs/using-k6/options
export const options = {
  vus: 300, 
  duration: '3s',
}

export default function main() {
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const shopId = [ "savrq123esvrs12r", "phyNum0ne1nW0r1d", "s1ffsw4556fvbtw0", "parti012239fhbnd", "ee2358gsnejvbs90"];
  const userName = ["John", "Oleg", "Dima", "Sergey", "Bogdan"];
  const queryExamples = ["Buriza", "Apple", "Lenovo", "BMW", "Milk"];
  const url = "https://nat7v6dhnb.execute-api.us-east-1.amazonaws.com/send_msg"
  const body = { user_id: userName[getRandomInt(0, 4)], shop_id: shopId[getRandomInt(0, 4)], query: queryExamples[getRandomInt(0, 4)]};

  let response = http.post(url, JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(response, {
    "status was 200": (r) => r.status == 200, });
  sleep(3)
}