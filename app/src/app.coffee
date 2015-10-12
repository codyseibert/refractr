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
      new Point p0_x + (t * s1_x), p0_y + (t * s1_y)
    else
      return undefined

  drawIntersection = (lineA, lineB) ->
    intersection = isIntersecting lineA, lineB
    if intersection?
      $svg.append intersection.$

  class Line
    constructor: (@p1, @p2, color = 'yellow') ->
      @$ = svgEl 'line'
        .addClass 'line'
        .attr 'stroke', color
      @refresh()

    refresh: ->
      @$
        .attr 'x1', @p1.x
        .attr 'y1', @p1.y
        .attr 'x2', @p2.x
        .attr 'y2', @p2.y

      @angle = Math.atan2 @p1.y - @p2.y, @p1.x - @p2.x

  class Point
    constructor: (@x, @y) ->
      @$ = svgEl 'circle'
        .attr 'r', '5'
        .attr 'fill', 'white'
        .attr 'cx', @x
        .attr 'cy', @y

  class Medium
    constructor: (@coef, @sides) ->

  class LightSource
    constructor: (@center, @numRays = 5, @theta = 0, @distsance = 5) ->

  lineA = new Line new Point(100, 100), new Point(355, 300)

  sideA = new Line new Point(200, 200), new Point(300, 200), 'cyan'
  sideB = new Line new Point(300, 200), new Point(300, 300), 'cyan'
  sideC = new Line new Point(300, 300), new Point(200, 300), 'cyan'
  sideD = new Line new Point(200, 300), new Point(200, 200), 'cyan'

  medium = new Medium 1.5, [sideA, sideB, sideC, sideD]

  for elem in [
    lineA
    sideA
    sideB
    sideC
    sideD
  ]
    $svg.append elem.$

  refractr = (line, medium) ->
    intersections = []
    for side in medium.sides
      intersection = isIntersecting line, side
      if intersection?
        intersections.push intersection

    p1 = side.p1
    vec1 = Victor p1.x, p1.y
    distances = []
    for intersection in intersections
      vec2 = Victor intersection.x, intersection.y
      distance = vec2.distanceSq vec1
      distances.push
        distance: distance
        point: intersection

    distances.sort (a, b) ->
      a.distance - b.distance

    if distances.length > 0
      closest = distances[0]
      line.p2 = closest.points
      line.refresh()

  extendLine = ->


  refractr lineA, medium
