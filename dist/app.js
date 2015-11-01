$(document).ready(function() {
  var $svg, LightSource, Line, Medium, Point, drawIntersection, elem, isIntersecting, isLeft, j, len, line, medium, mid, ref, refractr, svgEl, triangleA, triangleB, triangleC;
  $svg = $('#svg');
  isLeft = function(a, b, c) {
    return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0;
  };
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
      var divide, full, p1;
      this.$.attr('x1', this.p1.x).attr('y1', -this.p1.y + 500).attr('x2', this.p2.x).attr('y2', -this.p2.y + 500);
      this.angle = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
      this.normal = new Victor(Math.cos(this.angle), Math.sin(this.angle));
      this.normal.rotate(-Math.PI / 2);
      this.normal.normalize();
      this.vec = new Victor(this.p2.x, this.p2.y);
      this.vec.subtract(new Victor(this.p1.x, this.p1.y));
      full = this.vec.clone();
      p1 = new Victor(this.p1.x, this.p1.y);
      this.vec.normalize();
      divide = full.multiply(new Victor(0.5, 0.5));
      return this.midpoint = p1.add(divide);
    };

    return Line;

  })();
  Point = (function() {
    function Point(x1, y1) {
      this.x = x1;
      this.y = y1;
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
      var closest, distance, distances, dot, incident, inter, intersection, intersections, j, k, len, len1, newLine, newVec, norm, p1, p2, ref, side, theta2, vec1, vec2;
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
      if (distances.length > 1 && Math.round(distances[0].point.x) === Math.round(line.p1.x) && Math.round(distances[0].point.y) === Math.round(line.p1.y)) {
        distances.splice(0, 1);
      }
      if (distances.length > 0 && Math.round(distances[0].point.x) !== Math.round(line.p1.x) && Math.round(distances[0].point.y) !== Math.round(line.p1.y)) {
        closest = distances[0];
        line.p2 = closest.point;
        line.refresh();
        dot = closest.side.normal.dot(line.vec);
        incident = Math.acos(dot);
        if (isNaN(incident)) {
          incident = 0;
        }
        norm = closest.side.normal.clone();
        if (dot < 0) {
          theta2 = Math.asin(Math.sin(incident) / medium.coef);
          norm.multiply(new Victor(-1, -1));
          if (isLeft(closest.point, new Victor(closest.point.x, closest.point.y).add(norm), line.p1)) {
            theta2 *= -1;
          }
        } else {
          theta2 = Math.asin(Math.sin(incident) * medium.coef);
          if (isLeft(closest.point, new Victor(closest.point.x, closest.point.y).add(norm), line.p1)) {
            theta2 *= -1;
          }
        }
        newVec = norm.rotate(theta2);
        newVec.multiply(new Victor(1000000, 1000000));
        p1 = {
          x: closest.point.x,
          y: closest.point.y
        };
        p2 = {
          x: closest.point.x + newVec.x,
          y: closest.point.y + newVec.y
        };
        if (!isNaN(p1.x) && !isNaN(p1.y) && !isNaN(p2.x) && !isNaN(p2.y)) {
          newLine = new Line(p1, p2);
          $svg.append(newLine.$);
          newLine.$.addClass('ray');
          if (seen[newLine.p1.x + ' ' + newLine.p1.y] == null) {
            return fun(newLine, medium);
          }
        }
      }
    };
    return fun(line, medium);
  };
  triangleA = new Line(new Point(400, 400), new Point(300, 200), 'cyan');
  triangleB = new Line(new Point(500, 200), new Point(400, 400), 'cyan');
  triangleC = new Line(new Point(300, 200), new Point(500, 200), 'cyan');
  medium = new Medium(1.49, [triangleA, triangleB, triangleC]);
  ref = [triangleA, triangleB, triangleC];
  for (j = 0, len = ref.length; j < len; j++) {
    elem = ref[j];
    $svg.append(elem.$);
    mid = elem.midpoint.clone().add(elem.normal.clone().multiply(new Victor(30, 30)));
    line = new Line(new Point(elem.midpoint.x, elem.midpoint.y), new Point(mid.x, mid.y), 'red');
    $svg.append(line.$);
  }
  return $(document).click(function(event) {
    var DIST, RAYS, angle, i, k, ref1, results, step, x, y;
    x = event.pageX;
    y = $svg.height() - event.pageY - 200;
    $svg.find('.ray').remove();
    angle = 0;
    DIST = 1000;
    RAYS = 500;
    step = 2 * Math.PI / RAYS;
    results = [];
    for (i = k = 0, ref1 = RAYS; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      angle += step;
      line = new Line(new Point(x, y), new Point(x + Math.cos(angle) * DIST, y + Math.sin(angle) * DIST));
      $svg.append(line.$);
      line.$.addClass('ray');
      results.push(refractr(line, medium));
    }
    return results;
  });
});
