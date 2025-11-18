import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getDuration = new Trend('get_duration');
export const statusRate = new Rate('status_rate');

export const options = {
  stages: [
    { duration: '35s', target: 7 },
    { duration: '2m', target: 92 },
    { duration: '1m', target: 92 }
  ],

  thresholds: {
    http_req_duration: ['p(90)<6800'],
    http_req_failed: ['rate<0.25'],

    get_duration: ['p(90)<6800'],
    status_rate: ['rate>0.75']
  }
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {

  const res = http.get('https://fakestoreapi.com/users');

  getDuration.add(res.timings.duration);

  statusRate.add(res.status === 200);

  check(res, {
    'status é 200': r => r.status === 200
  });
}
