$(document).ready ->
  $svg = $('#svg')

  svgEl = (tag) ->
    $ document.createElementNS 'http://www.w3.org/2000/svg', tag

  isIntersecting = (lineA, lineB) ->
    p0_x = lineA.p1.x
    p0_y = lineA.p1.y
    p1_x = lineA.p2.x
    p1_y = lineA.p2.y

    p2_x = lineB.p1.x
    p2_y = lineB.p1.y
    p3_x = lineB.p2.x
    p3_y = lineB.p2.y

    s1_x = p1_x - p0_x
    s1_y = p1_y - p0_y
    s2_x = p3_x - p2_x
    s2_y = p3_y - p2_y

    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y)
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y)

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
      x: p0_x + (t * s1_x)
      y: p0_y + (t * s1_y)
    else
      return undefined

  drawIntersection = (lineA, lineB) ->
    intersection = isIntersecting lineA, lineB
    if intersection?
      intersect = new Point intersection.x, intersection.y
      $svg.append intersect.$

  class Line
    constructor: (@p1, @p2, color = 'yellow') ->
      @$ = svgEl 'line'
        .addClass 'line'
        .attr 'stroke', color
        .attr 'x1', @p1.x
        .attr 'y1', @p1.y
        .attr 'x2', @p2.x
        .attr 'y2', @p2.y

  class Point
    constructor: (@x, @y) ->
      @$ = svgEl 'circle'
        .attr 'r', '5'
        .attr 'fill', 'white'
        .attr 'cx', @x
        .attr 'cy', @y

  class Medium
    constructor: (@coef) ->

  class LightSource
    constructor: (@center, @numRays = 5, @theta = 0, @distsance = 5) ->

  lineA = new Line new Point(100, 100), new Point(355, 300)
  lineB = new Line new Point(100, 200), new Point(455, 100), 'red'
  lineC = new Line new Point(100, 300), new Point(355, 100), 'blue'
  $svg.append lineA.$
  $svg.append lineB.$
  $svg.append lineC.$

  drawIntersection lineA, lineB
  drawIntersection lineA, lineC
  drawIntersection lineC, lineB
