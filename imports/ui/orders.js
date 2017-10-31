import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating'
import { Tracker } from 'meteor/tracker'
import * as d3 from "d3";

import { Orders } from '../api/orders.js';

import './orders.html';

Tracker.autorun(() => {
  const orders = Orders.find({}).fetch();

  if (orders.length == 0) {
    return;
  }

  const graphWidth = 1000;
  const graphHeight = 500;
  const xAxisHeight = 30;
  const yAxisWidth= 35;
  const totalWidth = graphWidth + yAxisWidth;
  const totalHeight = graphHeight + xAxisHeight;
  const topMargin = 10;

  const svg = d3.select('#orders-svg').attr('viewBox', `0 0 ${totalWidth} ${totalHeight + topMargin}`);
  const graph = svg.append('g').attr('transform', `translate(0, ${topMargin})`);

  const xScale = d3.scaleTime().domain([new Date('2017-10-30'), new Date()]).range([yAxisWidth, totalWidth]);
  const yScale = d3.scaleLinear().domain([0, 2000]).range([graphHeight, 0]);
  const lineDescriber = d3.line().curve(d3.curveStepAfter).x((d) => {return xScale(d.timestamp)}).y((d) => {return yScale(d.price)});

  const lines = graph.append('g').selectAll('path').data(orders).enter().append('path').attr('fill', 'none').attr('stroke', 'rgba(0, 0, 0, 0.05)').attr('d', (d) => {
    const history = Array.from(d.history);

    let last = Object.assign({}, _.last(history), {timestamp: d.lastActiveAt});
    history.push(last);
    console.log(history)

    return lineDescriber(history);
  });

  const xAxis = d3.axisBottom(xScale).ticks(d3.timeDay.every(1));
  const xAxisGroup = graph.append('g').attr('transform', `translate(0, ${graphHeight})`);
  xAxisGroup.call(xAxis);

  const yAxis = d3.axisLeft(yScale).ticks(10);
  const yAxisGroup = graph.append('g').attr('transform', `translate(${yAxisWidth}, 0)`);
  yAxisGroup.append('rect').attr('x', -1 * yAxisWidth).attr('width', yAxisWidth).attr('height', graphHeight).attr('fill', 'white');
  yAxisGroup.call(yAxis);


});
