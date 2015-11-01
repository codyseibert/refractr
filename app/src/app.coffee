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
        .attr 'y1', -@p1.y + 500
        .attr 'x2', @p2.x
        .attr 'y2', -@p2.y + 500

      @angle = Math.atan2 @p2.y - @p1.y, @p2.x - @p1.x

      @normal = new Victor(Math.cos(@angle), Math.sin(@angle))
      @normal.rotate -Math.PI / 2
      @normal.normalize()

      @vec = new Victor(@p2.x, @p2.y)
      @vec.subtract new Victor(@p1.x, @p1.y)
      @vec.normalize()

  class Point
    constructor: (@x, @y) ->
      @$ = svgEl 'circle'
        .attr 'r', '5'
        .attr 'fill', 'white'
        .attr 'cx', @x
        .attr 'cy', -@y + 500

  class Medium
    constructor: (@coef, @sides) ->

  class LightSource
    constructor: (@center, @numRays = 5, @theta = 0, @distsance = 5) ->

  refractr = (line, medium) ->
    seen = {}

    fun = (line, medium) ->
      seen[line.p1.x + ' ' + line.p1.y] = true

      intersections = []
      for side in medium.sides
        intersection = isIntersecting line, side
        if intersection?
          intersections.push
            intersection: intersection
            side: side

      p1 = line.p1
      vec1 = new Victor p1.x, p1.y
      distances = []

      for intersection in intersections
        inter = intersection.intersection
        vec2 = new Victor inter.x, inter.y
        distance = vec2.distanceSq vec1
        distances.push
          distance: distance
          point: inter
          side: intersection.side

      distances.sort (a, b) ->
        a.distance - b.distance

      if distances.length > 1 and distances[0].point.x is line.p1.x and distances[0].point.y is line.p1.y
        distances.splice 0, 1

      if distances.length > 0 and distances[0].point.x isnt line.p1.x and distances[0].point.y isnt line.p1.y
        closest = distances[0]

        line.p2 = closest.point
        line.refresh()
        dot = closest.side.normal.dot(line.vec)
        incident = Math.acos(dot)
        if isNaN incident
          incident = 0

        if dot >= 0
          theta2 = Math.asin(Math.sin(incident) * medium.coef)
          newVec = closest.side.normal.clone().rotate -theta2
          console.log 'here'
        else
          theta2 = Math.asin(Math.sin(incident) / medium.coef)
          newVec = closest.side.normal.clone().multiply(new Victor(-1, -1)).rotate theta2
          console.log 'there'

        newVec.multiply(new Victor 1000000, 1000000)
        p1 =
          x: closest.point.x
          y: closest.point.y
        p2 =
          x: closest.point.x + newVec.x
          y: closest.point.y + newVec.y
        newLine = new Line p1, p2
        $svg.append newLine.$
        if not seen[newLine.p1.x + ' ' + newLine.p1.y]?
          fun newLine, medium
    fun line, medium

  # Create the medium
  sideA = new Line new Point(0, 200), new Point(200, 0), 'red'
  sideB = new Line new Point(500, 0), new Point(0, 500), 'green'
  # sideC = new Line new Point(300, 300), new Point(200, 300), 'blue'
  # sideD = new Line new Point(200, 300), new Point(200, 200), 'orange'
  medium = new Medium 2.5, [sideA, sideB]

  for elem in [
    sideA
    sideB
    # sideC
    # sideD
  ]
    $svg.append elem.$

  # Draw some random lines and refractr them
  angle = 0
  DIST = 1000
  for i in [0...30]
    angle += 0.05
    line = new Line new Point(0, 0), new Point(Math.cos(angle) * DIST, Math.sin(angle) * DIST)
    $svg.append line.$
    refractr line, medium
