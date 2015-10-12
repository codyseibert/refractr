$(document).ready(function() {
  var $svg, LightSource, Line, Medium, Point, drawIntersection, elem, extendLine, i, isIntersecting, len, lineA, medium, ref, refractr, sideA, sideB, sideC, sideD, svgEl;
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
      return new Point(p0_x + (t * s1_x), p0_y + (t * s1_y));
    } else {
      return void 0;
    }
  };
  drawIntersection = function(lineA, lineB) {
    var intersection;
    intersection = isIntersecting(lineA, lineB);
    if (intersection != null) {
      return $svg.append(intersection.$);
    }
  };
  Line = (function() {
    function Line(p11, p2, color) {
      this.p1 = p11;
      this.p2 = p2;
      if (color == null) {
        color = 'yellow';
      }
      this.$ = svgEl('line').addClass('line').attr('stroke', color);
      this.refresh();
    }

    Line.prototype.refresh = function() {
      this.$.attr('x1', this.p1.x).attr('y1', this.p1.y).attr('x2', this.p2.x).attr('y2', this.p2.y);
      return this.angle = Math.atan2(this.p1.y - this.p2.y, this.p1.x - this.p2.x);
    };

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
    function Medium(coef, sides) {
      this.coef = coef;
      this.sides = sides;
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
  sideA = new Line(new Point(200, 200), new Point(300, 200), 'cyan');
  sideB = new Line(new Point(300, 200), new Point(300, 300), 'cyan');
  sideC = new Line(new Point(300, 300), new Point(200, 300), 'cyan');
  sideD = new Line(new Point(200, 300), new Point(200, 200), 'cyan');
  medium = new Medium(1.5, [sideA, sideB, sideC, sideD]);
  ref = [lineA, sideA, sideB, sideC, sideD];
  for (i = 0, len = ref.length; i < len; i++) {
    elem = ref[i];
    $svg.append(elem.$);
  }
  refractr = function(line, medium) {
    var closest, distance, distances, intersection, intersections, j, k, len1, len2, p1, ref1, side, vec1, vec2;
    intersections = [];
    ref1 = medium.sides;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      side = ref1[j];
      intersection = isIntersecting(line, side);
      if (intersection != null) {
        intersections.push(intersection);
      }
    }
    p1 = side.p1;
    vec1 = Victor(p1.x, p1.y);
    distances = [];
    for (k = 0, len2 = intersections.length; k < len2; k++) {
      intersection = intersections[k];
      vec2 = Victor(intersection.x, intersection.y);
      distance = vec2.distanceSq(vec1);
      distances.push({
        distance: distance,
        point: intersection
      });
    }
    distances.sort(function(a, b) {
      return a.distance - b.distance;
    });
    if (distances.length > 0) {
      closest = distances[0];
      line.p2 = closest.points;
      return line.refresh();
    }
  };
  extendLine = function() {};
  return refractr(lineA, medium);
});
