$(document).ready(function() {
  var $svg, LightSource, Line, Medium, Point, drawIntersection, isIntersecting, lineA, lineB, lineC, svgEl;
  $svg = $('#svg');
  svgEl = function(tag) {
    return $(document.createElementNS('http://www.w3.org/2000/svg', tag));
  };
  isIntersecting = function(lineA, lineB) {
    var p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y, s, s1_x, s1_y, s2_x, s2_y, t;
    p0_x = lineA.p1.x;
    p0_y = lineA.p1.y;
    p1_x = lineA.p2.x;
    p1_y = lineA.p2.y;
    p2_x = lineB.p1.x;
    p2_y = lineB.p1.y;
    p3_x = lineB.p2.x;
    p3_y = lineB.p2.y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return {
        x: p0_x + (t * s1_x),
        y: p0_y + (t * s1_y)
      };
    } else {
      return void 0;
    }
  };
  drawIntersection = function(lineA, lineB) {
    var intersect, intersection;
    intersection = isIntersecting(lineA, lineB);
    if (intersection != null) {
      intersect = new Point(intersection.x, intersection.y);
      return $svg.append(intersect.$);
    }
  };
  Line = (function() {
    function Line(p1, p2, color) {
      this.p1 = p1;
      this.p2 = p2;
      if (color == null) {
        color = 'yellow';
      }
      this.$ = svgEl('line').addClass('line').attr('stroke', color).attr('x1', this.p1.x).attr('y1', this.p1.y).attr('x2', this.p2.x).attr('y2', this.p2.y);
    }

    return Line;

  })();
  Point = (function() {
    function Point(x, y) {
      this.x = x;
      this.y = y;
      this.$ = svgEl('circle').attr('r', '5').attr('fill', 'white').attr('cx', this.x).attr('cy', this.y);
    }

    return Point;

  })();
  Medium = (function() {
    function Medium(coef) {
      this.coef = coef;
    }

    return Medium;

  })();
  LightSource = (function() {
    function LightSource(center, numRays, theta, distsance) {
      this.center = center;
      this.numRays = numRays != null ? numRays : 5;
      this.theta = theta != null ? theta : 0;
      this.distsance = distsance != null ? distsance : 5;
    }

    return LightSource;

  })();
  lineA = new Line(new Point(100, 100), new Point(355, 300));
  lineB = new Line(new Point(100, 200), new Point(455, 100), 'red');
  lineC = new Line(new Point(100, 300), new Point(355, 100), 'blue');
  $svg.append(lineA.$);
  $svg.append(lineB.$);
  $svg.append(lineC.$);
  drawIntersection(lineA, lineB);
  drawIntersection(lineA, lineC);
  return drawIntersection(lineC, lineB);
});
