$(document).ready(function() {
  var $svg, DIST, LightSource, Line, Medium, Point, angle, drawIntersection, elem, i, isIntersecting, j, k, len, line, medium, ref, refractr, results, sideA, sideB, svgEl;
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
    function Line(p11, p21, color) {
      this.p1 = p11;
      this.p2 = p21;
      if (color == null) {
        color = 'yellow';
      }
      this.$ = svgEl('line').addClass('line').attr('stroke', color);
      this.refresh();
    }

    Line.prototype.refresh = function() {
      this.$.attr('x1', this.p1.x).attr('y1', -this.p1.y + 500).attr('x2', this.p2.x).attr('y2', -this.p2.y + 500);
      this.angle = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
      this.normal = new Victor(Math.cos(this.angle), Math.sin(this.angle));
      this.normal.rotate(-Math.PI / 2);
      this.normal.normalize();
      this.vec = new Victor(this.p2.x, this.p2.y);
      this.vec.subtract(new Victor(this.p1.x, this.p1.y));
      return this.vec.normalize();
    };

    return Line;

  })();
  Point = (function() {
    function Point(x, y) {
      this.x = x;
      this.y = y;
      this.$ = svgEl('circle').attr('r', '5').attr('fill', 'white').attr('cx', this.x).attr('cy', -this.y + 500);
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
  refractr = function(line, medium) {
    var fun, seen;
    seen = {};
    fun = function(line, medium) {
      var closest, distance, distances, dot, incident, inter, intersection, intersections, j, k, len, len1, newLine, newVec, p1, p2, ref, side, theta2, vec1, vec2;
      seen[line.p1.x + ' ' + line.p1.y] = true;
      intersections = [];
      ref = medium.sides;
      for (j = 0, len = ref.length; j < len; j++) {
        side = ref[j];
        intersection = isIntersecting(line, side);
        if (intersection != null) {
          intersections.push({
            intersection: intersection,
            side: side
          });
        }
      }
      p1 = line.p1;
      vec1 = new Victor(p1.x, p1.y);
      distances = [];
      for (k = 0, len1 = intersections.length; k < len1; k++) {
        intersection = intersections[k];
        inter = intersection.intersection;
        vec2 = new Victor(inter.x, inter.y);
        distance = vec2.distanceSq(vec1);
        distances.push({
          distance: distance,
          point: inter,
          side: intersection.side
        });
      }
      distances.sort(function(a, b) {
        return a.distance - b.distance;
      });
      if (distances.length > 1 && distances[0].point.x === line.p1.x && distances[0].point.y === line.p1.y) {
        distances.splice(0, 1);
      }
      if (distances.length > 0 && distances[0].point.x !== line.p1.x && distances[0].point.y !== line.p1.y) {
        closest = distances[0];
        line.p2 = closest.point;
        line.refresh();
        dot = closest.side.normal.dot(line.vec);
        incident = Math.acos(dot);
        if (isNaN(incident)) {
          incident = 0;
        }
        if (dot >= 0) {
          theta2 = Math.asin(Math.sin(incident) * medium.coef);
          newVec = closest.side.normal.clone().rotate(-theta2);
          console.log('here');
        } else {
          theta2 = Math.asin(Math.sin(incident) / medium.coef);
          newVec = closest.side.normal.clone().multiply(new Victor(-1, -1)).rotate(theta2);
          console.log('there');
        }
        newVec.multiply(new Victor(1000000, 1000000));
        p1 = {
          x: closest.point.x,
          y: closest.point.y
        };
        p2 = {
          x: closest.point.x + newVec.x,
          y: closest.point.y + newVec.y
        };
        newLine = new Line(p1, p2);
        $svg.append(newLine.$);
        if (seen[newLine.p1.x + ' ' + newLine.p1.y] == null) {
          return fun(newLine, medium);
        }
      }
    };
    return fun(line, medium);
  };
  sideA = new Line(new Point(0, 200), new Point(200, 0), 'red');
  sideB = new Line(new Point(500, 0), new Point(0, 500), 'green');
  medium = new Medium(2.5, [sideA, sideB]);
  ref = [sideA, sideB];
  for (j = 0, len = ref.length; j < len; j++) {
    elem = ref[j];
    $svg.append(elem.$);
  }
  angle = 0;
  DIST = 1000;
  results = [];
  for (i = k = 0; k < 30; i = ++k) {
    angle += 0.05;
    line = new Line(new Point(0, 0), new Point(Math.cos(angle) * DIST, Math.sin(angle) * DIST));
    $svg.append(line.$);
    results.push(refractr(line, medium));
  }
  return results;
});
