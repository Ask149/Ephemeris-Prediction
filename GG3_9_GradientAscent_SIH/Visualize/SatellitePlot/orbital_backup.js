// Author: Ask149
var final_color = 0xff0000
var mycolor = 0x888888;
var temp = 0.8  ;
var axs = [];
var ecc = [];
var inc = [];
var bog = [];
var sog = [];
var man = [];
var axs1 = [];
var predicted = false;
var ecc1 = [];
var inc1 = [];
var bog1 = [];
var sog1 = [];
var man1 = [];
var index = 0;
var plotLength = 10;

function readPredicted(){
    $.ajax({
    type: "GET",
    url: "predict.txt",
    dataType: "text",
    success: function(data) {processData1(data);}
  });
    predicted=true;
    console.log('In readPredicted');
}

function processData1(allText){
  console.log('In processData1');
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  var lines = []; 
  console.log("Length : "+allTextLines.length);
  for (var i=1; i<allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
    if (data.length == headers.length) {
      var tarr = [];
      var flag = false;
      for (var j=0; j<headers.length; j++) {
        if(headers[j]=="prn" ) {
          flag = true;
        }
        if(flag==true)
        {
          tarr.push(headers[j]+":"+data[j]);
          if(headers[j]=="sqrt_semi_major_axis"){
            axs1.push(parseFloat(data[j]));
          }
          else if(headers[j]=="essentricity"){
            ecc1.push(parseFloat(data[j]));
          }
          else if(headers[j]=="inclination"){
            inc1.push(parseFloat(data[j]));
          }
          else if(headers[j]=="OMEGA"){
            bog1.push(parseFloat(data[j]));
          }
          else if(headers[j]=="omega"){
            sog1.push(parseFloat(data[j]));
          }
          else if(headers[j]=="mean_anomaly"){
            man1.push(parseFloat(data[j]));
          }
        }
      }
      if(flag)
      {
        lines.push(tarr);
      }
    }
  }
  callCreateOrbit1();
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

function callCreateOrbit(){  
  predicted = false;
  console.log(axs.length);
  //plotLength = axs.length;
  for(var i=0; i<plotLength; i++){
    $("#add_orbit").click();
    // same thing, using await syntax
    setTimeout(function(){
      //console.log(axs[i]+" "+ecc[i]+" "+inc[i]+" "+bog[i]+" "+sog[i]+" "+man[i]);
    }, 1000);
  }
}

function callCreateOrbit1(){  
  predicted = true;
  console.log(axs.length);
  //plotLength = axs.length;
  for(var i=0; i<plotLength; i++){
    $("#add_orbit").click();
    // same thing, using await syntax
    setTimeout(function(){
      //console.log(axs[i]+" "+ecc[i]+" "+inc[i]+" "+bog[i]+" "+sog[i]+" "+man[i]);
    }, 1000);
  }
}

function processData(allText) {
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  var lines = []; 
  console.log("Length : "+allTextLines.length);
  for (var i=1; i<allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
    if (data.length == headers.length) {
      var tarr = [];
      var flag = false;
      for (var j=0; j<headers.length; j++) {
        if(headers[j]=="prn" ) {
          flag = true;
        }
        if(flag==true)
        {
          tarr.push(headers[j]+":"+data[j]);
          if(headers[j]=="sqrt_semi_major_axis"){
            axs.push(parseFloat(data[j]));
          }
          else if(headers[j]=="essentricity"){
            ecc.push(parseFloat(data[j]));
          }
          else if(headers[j]=="inclination"){
            inc.push(parseFloat(data[j]));
          }
          else if(headers[j]=="OMEGA"){
            bog.push(parseFloat(data[j]));
          }
          else if(headers[j]=="omega"){
            sog.push(parseFloat(data[j]));
          }
          else if(headers[j]=="mean_anomaly"){
            man.push(parseFloat(data[j]));
          }
        }
      }
      if(flag)
      {
        lines.push(tarr);
      }
    }
  }
  //console.log(lines);
  for(var i=0;i<axs.length;i++){
//    console.log(axs[i]+" "+ecc[i]+" "+inc[i]+" "+bog[i]+" "+sog[i]+" "+man[i]);
  }
}

var Orbital = {
  orbits:            [],
  satellites:        [],
  rad_to_deg:        180 / π,
  deg_to_rad:        π / 180,
  display_precision: 3,
  samples:           1024,
  sampling_scale:    2 * π / (1024 - 1),
  twoπ:              2 * π,
  πhalf:             0.5 * π,
  z_index:           2,
  axis_scale:        0.03,
  thrust_scale:      0.005,
  velocity_scale:    100,
  time_scale:        1,
  second_rotation:   (2 * π) / (60 * 60 * 24),
  r0:                6371000,                  // Mean earth radius in meters
  r0k:               6371,
  g0:                9.81,                     // Standard gravity in m/s^2
  trajectory_n:      1800,
  equatorial_speed:  ((2 * π) / (60 * 60 * 24) ), 
  tr_scale:          9.81 / 6371000,
  tr_scale_inv_sq:   Math.sqrt(6371000 / 9.81),
  tr_scale_inv2:     6371000 / (2 * 9.81),
  ov_scale:          9.81 * 6371000,
  current_time:      0,
  earth_φ:           0,
  drag_x:            0,
  drag_y:            0,
  follow_zoom:       1,
  trajectory_density: 10,
  following:         false
};

//////////////////////////////
// General control handlers //
//////////////////////////////

Orbital.addPointsToGraph = function(graph, data){
  data = data.split('|');
  var n = data.length;
  if (n > 0){
    for (var i = 0; i < n; i++){
      var point = data[i].split(':');
      if (point.length == 2){ 
        Orbital.addPoint.call(graph, false, point[0] * 1, point[1] * 1); 
      }
    }
  }   
}

Orbital.createOrbit = function(){
  var input = $('#orbit_name');
  Orbital.addOrbit(input.val());
  input.val('');
  var hidePlane = $('.hide_plane');
  var toggleView = $('.toggle_view');
  for(var i=0;i<hidePlane.length; i++)
  { 
    var cname = hidePlane[i].getAttribute('class');
    if(cname.indexOf("hidden") == -1){
      hidePlane[i].click();
      toggleView[i].click();      
    }
  }
}

Orbital.toggleAxis = function(){
  var toggle = $(this);
  toggle.toggleClass('selected');
  Orbital.mathbox.select('axis, #equatorial_plane').set('visible', !toggle.hasClass('selected'));
}

Orbital.toggleHelp = function(){
  var toggle = $(this);
  toggle.toggleClass('selected');  
  if (toggle.hasClass('selected')){
    $('body').removeClass('help');
  } else {
    $('body').addClass('help');
  }
}

Orbital.restart = function(){
  Orbital.mathbox.select('.widget').remove();
  Orbital.follow = false;
  $('.orbit').remove();
  Orbital.camera.set('position', [0, 1, 2]);
  Orbital.camera.set('lookAt', [0, 0, 0]); 
  Orbital.camera.set('up', [0, 1, 0]); 
  $('canvas').off('mousewheel.orbital');
  $('canvas').off('mousemove.orbital');
  $('canvas').off('touchmove.orbital'); 
}

/////////////
// Sliders //
/////////////

Orbital.createControl = function(name, range, units, step, options){
  if (!options){
    options = {};
  }
  var value   = options['value'];
  var handler = options['handler'];

  if (!value){
    value = 0;
  }
  var slider_container = $('<div class="slider_container"></div>');
  var slider_label     = $('<span class="slider_label">' + name + ' = </span>');
  var slider_value     = $('<span contentEditable class="slider_value">' + value + '</span>'); 
  var slider_unit      = $('<span>' + units + '</span>');
  var slider           = $('<div class="slider"></div>');
  var edit_button      = $('<img src="images/edit.svg" class="edit_button">');
  var slide_handler;

  if (!handler){
    handler = Orbital.updateSliderLabel;
  }

  slider_container.append(slider, slider_label, slider_value, slider_unit, edit_button);
  slider.slider({
    step: step,
    value: value,
    min: range[0],
    max: range[1],
    slide: handler,
    change: handler
  });
  slider_value.on('keyup', Orbital.keyUpdate);
  slider_value.on('keydown', Orbital.disableKeyEvent);
  edit_button.on('click', Orbital.startControlEdit);
  slider.data({
    label: slider_value,
    units: units
  });
  slider_container.data('slider', slider);
  return (slider_container);
}

Orbital.startControlEdit = function(){
  $(this).closest('.slider_container').find('.slider_value').focus();
}

Orbital.keyUpdate = function(e){
  var input = $(this);
  input.html(input.text().replace(/[^0-9\.\-]/g,'').replace(/\.+/g,'.'));
  if (e.keyCode == 13){
    var slider = input.closest('.slider_container').find('.slider');
    slider.slider('value', input.text() * 1);
    input.blur();
  }
  e.stopPropagation();
  e.preventDefault();
}

Orbital.disableKeyEvent = function(e){
  e.stopPropagation();
}

Orbital.updateSliderLabel = function(e, ui){
  var slider = $(this);
  if (ui){
    slider.data('label').html(ui.value);
  } else {
    slider.data('label').html(slider.slider('value'));
  }
}


////////////
// Graphs //
////////////

Orbital.addGraph = function(graph_class){
  var graph            = $('<div class="graph ' + graph_class + '_graph"></div>');
  var container        = $('<div class="graph_container"></div>'); 
  var frame            = $('<div class="graph_frame"></div>');
  var values           = $('<div class="graph_values"></div>');
  var label            = $('<div class="graph_label"></div>');
  var add_point        = $('<div class="add_point add_button">add point</div>');
  var clear_points     = $('<div class="clear_points add_button">clear points</div>');
  var line             = $('<div class="graph_line"></div>');
  var marker_sizer     = $('<div class="marker_sizer"></div>');
  var marker_container = $('<div class="marker_container"></div>');
  var time_marker      = $('<div class="time_marker"></div>');

  for (var i = 1; i <= 30; i++){
    var marker = $('<div class="marker"><div class="marker_label">' + i + 'm</div></div>');
    marker.css('left', i * 120);
    values.append(marker);
  } 
 
  for (var i = -4; i <= 4; i++){
    var marker = $('<div class="g_marker"><div class="marker_line"><div class="marker_label">' + i + 'g</div></div></div>');
    marker.css('bottom', 110 + i * 20);
    marker_container.append(marker);
  } 
  
  values.draggable({
    axis: 'x',
    drag: Orbital.limitGraph
  });

  label.on('click', Orbital.selectGraph);
  add_point.on('click', Orbital.addPoint);
  clear_points.on('click', Orbital.clearPoints);
  values.data('line', line);
  graph.data({
    time_marker: time_marker,
    interpolation: false
  });

  frame.append(values);
  values.append(time_marker, line);
  container.append(frame)
  marker_sizer.append(marker_container);
  graph.append(container, marker_sizer, label, add_point, clear_points);

  return (graph);
}

Orbital.limitGraph = function(e, ui){
  var x  = ui.position.left;
  var w  = $(this).closest('.graph_frame').width();
  var xl = -3600 + w;

  if (x > 0){
    $(this).css('left', 0);
    e.preventDefault();
  }
  if (x < xl){
    $(this).css('left', xl);
    e.preventDefault();
  }
}

Orbital.moveSelectedPoint = function(e){
  var point = $('.point.active');

  if (point.length > 0){
    var position = point.position();
    var x = position.left;
    var y = position.top;

    switch(e.keyCode){
      case 38:
        y -= 1; 
        break;
      case 40:
        y += 1;
        break;
      case 37:
        x -= 1; 
        break;
      case 39:
        x += 1;
        break;
    }
    
    point.css({
      left: x,
      top: y
    });
    Orbital.pointDrag.call(point);
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}

Orbital.clearPoints = function(){
  var graph  = $(this).closest('.graph');
  var values = graph.find('.graph_values');
  graph.find('.point').remove();
  graph.find('.graph_line').html('');
  Orbital.updateLine(values);
  index=0;
}

Orbital.addPoint = function(e, x, y){
  var graph  = $(this).closest('.graph');
  var point  = $('<div class="point"></div>');
  var value  = $('<div class="value"></div>');
  var label  = $('<div class="label"></div>');
  var close  = $('<div class="remove_point">×</div>');
  var values = graph.find('.graph_values');

  point.append(value, label, close);
  close.on('click', Orbital.removePoint);
  point.data({
    value:  value,
    values: values,
    line:   graph.find('.graph_line'),
    label:  label
  });
  point.draggable({
    drag: Orbital.pointDrag,
    stop: Orbital.pointDrag
  });
  point.css({
    left: x == undefined ? -10 : x,
    top:  y == undefined ?  90 : y
  });
  point.on('dblclick', Orbital.togglePointSelection);
  Orbital.togglePointSelection.call(point);
  values.append(point);
  Orbital.updateLine(values);
}

Orbital.togglePointSelection = function(){
  var point = $(this);
  if (point.hasClass('active')){
    point.removeClass('active');
  } else {
    $('.point').removeClass('active');
    point.addClass('active');
  }
}

Orbital.removePoint = function(){
  var point  = $(this).closest('.point');
  var values = point.data('values');
  point.remove();
  Orbital.updateLine(values);
}

Orbital.pointDrag = function(e, ui){
  var point    = $(this);
  var position = point.position();
  var x        = 0.5 * (position.left + 10);
  var y        = 0.05 * (90 - position.top);

  point.data('label').html('[' + x.toPrecision(3) + ', ' + y.toPrecision(3) + ']');
  Orbital.updateLine(point.data('values'));
}

Orbital.sortPoint = function(a, b){ 
  var ax = $(a).position().left;
  var bx = $(b).position().left;
  
  if (ax > bx){
    return 1;
  } else if (ax < bx){
    return -1;
  } else {
    return 0;
  }
}

Orbital.updateLine = function(values){
  var points        = values.find('.point');
  var svg           = '<svg viewBox="0 0 3600 200" width="3600px" height="200px"><path style="fill:none;fill-rule:evenodd;stroke:#ff6600;stroke-width:2px;stroke-opacity:0.8" d="';
  var n             = points.length;
  var graph         = values.closest('.graph');
  var interpolation = [];

  points.sort(Orbital.sortPoint);
  if (n > 1){
    for (var i = 0; i < n; i++){
      var pn, xn, yn, dx;
      var p = points.eq(i).position();
      
      var x = p.left;
      var y = p.top;
      if (i == 0){
        svg += 'M' + (x + 10) + ' ' + (y + 10);
      } else {
        svg +=' L' + (x + 10) + ' ' + (y + 10);
      }
      x = 0.5 * (x + 10);
      y = 0.05 * (90 - y);
      if (i < n -1){
        pn = points.eq(i + 1).position();
        xn = 0.5 * (pn.left + 10);
        yn = 0.05 * (90 - pn.top);
        dx = xn - x;
        if (dx != 0){
          interpolation.push([x, y, (yn - y) / dx]);
        } else {
          interpolation.push([x, y, 0]);
        }
      } else {
        interpolation.push([x, y, 0]);
      }
    }
    svg += '"/></svg>';
    values.data('line').html(svg);
    graph.data('interpolation', interpolation);
    graph.data('tstart', (points.eq(0).position().left + 10) * 0.5);
    graph.data('tend', (points.eq(n - 1).position().left + 10) * 0.5);
  } else {
    values.data('line').html('');
    graph.data('interpolation', false);
  }
}

Orbital.getGraphValue = function(graph, t){
  var interpolation = graph.data('interpolation');
  if (interpolation){
    var n = interpolation.length - 1;
    if ((graph.data('tstart') <= t) && (graph.data('tend') >= t)){
      for (var i = 0; i < n; i++){
        var d  = interpolation[i];
        var dn = interpolation[i + 1];
        
        if (t == d[0]){
          return d[1];
        }
        if (t == dn[0]){
          return dn[1];
        }
        if (t > d[0] && t < dn[0]){
          return d[1] + d[2] * (t - d[0]);
        }
      }
    }
  } 
  return 0; 
}

Orbital.selectGraph = function(){
  $('.graph').removeClass('active');
  $(this).closest('.graph').addClass('active');
}


////////////////
// Interfaces //
////////////////

//////////////
// Launches //
//////////////

Orbital.removeInterface = function(){
  var orbit = $(this).closest('.orbit');
  var name  = orbit.data('name');
  //Orbital.mathbox.select('.orbit_' + name + ', .launch_site_' + name).remove();
  orbit.remove();
  if (orbit.data('follow')){
    $('canvas').off('mousewheel.orbital');
    $('canvas').off('mousemove.orbital');
    $('canvas').off('touchmove.orbital');
  }
}

Orbital.force = function(r){
  var n = Orbital.norm(r);
  var f = - 1 / (n * n * n);

  return([ r[0] * f, r[1] * f, r[2] * f ]);
}

Orbital.norm = function(v){
  return(Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]));
}

Orbital.normalize = function(v){
  var n = Orbital.norm(v);
  return([v[0]/n, v[1]/n, v[2]/n]);
}

Orbital.crossProduct = function(v1, v2){
  return(
    [
      v1[1] * v2[2] - v1[2] * v2[1],
     -v1[0] * v2[2] + v1[2] * v2[0],
      v1[0] * v2[1] - v1[1] * v2[0]       
    ]
  );
}

Orbital.scalarProduct = function(v1, v2){
  return (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]);
}

Orbital.rotateByAxis = function(v, u, θ){
  var c  = Math.cos(θ);
  var s  = Math.sin(θ);
  var cm = 1 - c;
  var v0 = v[0];
  var v1 = v[1];
  var v2 = v[2];
  var u0 = u[0];
  var u1 = u[1];
  var u2 = u[2];

  return([
    (c + u0 * u0 * cm) * v0 + (u0 * u1 * cm - u2 * s) * v1 + (u0 * u2 * cm + u2 * s) * v2,
    (u0 * u1 * cm + u2 * s) * v0 + (c + u1 * u1 * cm) * v1 + (u1 * u2 * cm - u1 * s) * v2,
    (u0 * u2 * cm - u1 * s) * v0 + (u1 * u2 * cm + u0 * s) * v1 + (c + u2 * u2 * cm) * v2
  ]);
}

Orbital.getInclination = function(t_r, node){
  var normal = Orbital.normalize(Orbital.crossProduct(t_r, node));

  return((t_r[1] > 0 ? 1 : -1) * Math.acos(normal[1]));
}

Orbital.planeNormal = function(inclination, Ω){
  return([
    -Math.sin(inclination) * Math.cos(Ω), 
    Math.cos(inclination), 
    Math.sin(inclination) * Math.sin(Ω)
  ])
}

////////////
// Orbits //
////////////

Orbital.addOrbit = function(name){
  index = index + 1;
  var slider_container_a;
  var slider_container_e;
  var slider_container_i;
  var slider_container_ω;
  var slider_container_Ω;
  var slider_container_ν;
  if(predicted==false){
    slider_container_a = Orbital.createControl('a', [1, 6], '', 0.01, { value : axs[index] });
    slider_container_e = Orbital.createControl('e', [0, 1], '', 0.01, { value : ecc[index] });
    slider_container_i = Orbital.createControl('i', [0, 180], '°', 0.2, { value : inc[index]});
    slider_container_ω = Orbital.createControl('ω', [0, 360], '°', 0.2, { value : sog[index] });
    slider_container_Ω = Orbital.createControl('Ω', [0, 360], '°', 0.2, { value : bog[index] });
    slider_container_ν = Orbital.createControl('ν', [0, 360], '°', 0.2, { value : man[index] });
  }
  else{
    slider_container_a = Orbital.createControl('a', [1, 6], '', 0.01, { value : axs1[index] });
    slider_container_e = Orbital.createControl('e', [0, 1], '', 0.01, { value : ecc1[index] });
    slider_container_i = Orbital.createControl('i', [0, 180], '°', 0.2, { value : inc1[index]});
    slider_container_ω = Orbital.createControl('ω', [0, 360], '°', 0.2, { value : sog1[index] });
    slider_container_Ω = Orbital.createControl('Ω', [0, 360], '°', 0.2, { value : bog1[index] });
    slider_container_ν = Orbital.createControl('ν', [0, 360], '°', 0.2, { value : man1[index] });
  }
  var orbit              = $('<div class="orbit"></div>');
  var controls           = $('<div class="controls"></div>');
  var label              = $('<h2>' + name + '</h2>');
  var close              = $('<div class="close">×</div>');
  var minimize           = $('<div class="minimize_arrow"></div>');
  var hide_plane         = $('<div class="hide_plane"></div>');
  var toggle             = $('<div class="toggle_view"></div>');
  //var launch             = $('<div class="add_to_launch"></div>');  
  //var energy_container   = $('<span class="launch_value_container"><span>ε=-</span><span class="launch_value">0</span>gr</span>');
  //var momentum_container = $('<span class="launch_value_container"><span>&nbsp;H=</span><span class="launch_value">0</span>√(gr)r</span>');
  //var energy_value       = energy_container.find('.launch_value');
  //var momentum_value     = momentum_container.find('.launch_value');

  var slider_a = slider_container_a.data('slider');
  var slider_e = slider_container_e.data('slider');
  var slider_i = slider_container_i.data('slider');
  var slider_ω = slider_container_ω.data('slider');
  var slider_Ω = slider_container_Ω.data('slider');
  var slider_ν = slider_container_ν.data('slider');

  controls.append(slider_container_a, slider_container_e, slider_container_i, slider_container_ω, slider_container_Ω, slider_container_ν);
  orbit.append(label, controls, close, minimize, hide_plane, toggle);//, energy_container, momentum_container);

  close.on('click', Orbital.removeInterface);
  hide_plane.on('click', Orbital.togglePlane);
  minimize.on('click', Orbital.toggleOrbitInterface);
  toggle.on('click', Orbital.toggleOrbitView);
  /*launch.draggable({
    axis: 'y',
    revert: true,
    revertDuration: 200
  });
*/
  $('#orbits').append(orbit);
  orbit.data({
    name: Orbital.z_index,
    slider_a: slider_a,
    slider_e: slider_e,
    slider_i: slider_i,
    slider_ω: slider_ω,
    slider_Ω: slider_Ω,
    slider_ν: slider_ν
  });

  var getOrbitPoint = function(){
    var a           = slider_a.data('label').text() * 1;
    var e           = slider_e.data('label').text() * 1;
    var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
    var ω           = Orbital.deg_to_rad * slider_ω.data('label').text() * 1 - Orbital.πhalf;
    var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
    var θ           = -Orbital.deg_to_rad * slider_ν.data('label').text() * 1;
    var ri          = Orbital.orbitEquation(a, e, θ, inclination, ω, Ω);
    var er          = Orbital.orbitEquation(1, 0, θ, inclination, ω, Ω);
    var eθ          = Orbital.orbitEquation(1, 0, θ - Orbital.πhalf, inclination, ω, Ω);

    var k  = Math.sqrt(Orbital.tr_scale / (a * (1 - e * e) ) );
    var kc = k * (1 + e * Math.cos(-θ));
    var ks = k * e * Math.sin(-θ);

    return({
      ri: ri,
      vi: [ ks * er[0] + kc * eθ[0], ks * er[1] + kc * eθ[1], ks * er[2] + kc * eθ[2] ]
    });
  }

  orbit.data('getOrbitPoint', getOrbitPoint);

  Orbital.orbits[Orbital.z_index] = orbit;

  Orbital.view.area({
    width: 8,
    height: 8,
    rangeX: [-10, 10],
    rangeY: [-10, 10],
    classes: ['widget', 'orbit_' + Orbital.z_index],
    expr: function (emit, x, y, i, j, time) {
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
      
      var x1 = x * Math.cos(inclination);
      var y1 = y;
      var x2 =  x1 * Math.cos(Ω) + y1 * Math.sin(Ω);
      var y2 = -x1 * Math.sin(Ω) + y1 * Math.cos(Ω);
      emit(x2, x * Math.sin(inclination), y2);
    },
    channels: 3,
  })
  .surface({
    points: '<',
    color: 0xff6600,
    opacity:0.55,
    zOrder: Orbital.z_index + 1000,
    id: 'orbital_plane_' + Orbital.z_index,
    classes: ['widget', 'orbit_' + Orbital.z_index, 'orbit_vis_' + Orbital.z_index]
  })
  .array({
    width: 2,
    channels: 3,
    classes: ['widget', 'orbit_' + Orbital.z_index],
    expr: function(emit, i, t){
      var a           = slider_a.data('label').text() * 1;
      var e           = slider_e.data('label').text() * 1;
      var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
      var ω          = Orbital.deg_to_rad * slider_ω.data('label').text() * 1 - Orbital.πhalf;
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      var coordinates = Orbital.orbitEquation(a, e, i * π, inclination, ω, Ω); 
      emit(coordinates[0], coordinates[1], coordinates[2]);
    }
  })
  .line({
    color:  0xffffff,
    opacity: 0.8,
    points: '<',
    width:  2,
    depth: 0.5,
    zOrder: -990 + Orbital.z_index,
    id: 'orbit_major_axis_' + Orbital.z_index,
    classes: ['widget', 'labels', 'orbit_' + Orbital.z_index, 'orbit_vis_' + Orbital.z_index]   
  })
  .array({
    width: 2,
    channels: 3,
    classes: ['widget', 'orbit_' + Orbital.z_index],
    expr: function(emit, i, t){
      var a           = slider_a.data('label').text() * 1;
      var e           = slider_e.data('label').text() * 1;
      var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
      var ω          = Orbital.deg_to_rad * slider_ω.data('label').text() * 1 - Orbital.πhalf;
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      var coordinates = Orbital.orbitEquation(a, e, Orbital.πhalf + i * π, inclination, ω, Ω); 
      emit(coordinates[0], coordinates[1], coordinates[2]);
    }
  })
  .line({
    color:  0xffffff,
    opacity: 0.8,
    points: '<',
    width:  2,
    depth: 0.5,
    zOrder: -990 + Orbital.z_index,
    id: 'orbit_minor_axis_' + Orbital.z_index,
    classes: ['widget', 'labels', 'orbit_' + Orbital.z_index, 'orbit_vis_' + Orbital.z_index]   
  })
  .array({
    width: 52,
    channels: 3,
    classes: ['widget', 'orbit_' + Orbital.z_index],
    expr: function(emit, i, t){
      var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
      var ω          = Orbital.deg_to_rad * slider_ω.data('label').text() * 1 - Orbital.πhalf;
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      if (i == 0){
        emit(0,0,0);
      } else {
        if (i == 51){
          emit(0,0,0);
        } else {
          var coordinates = Orbital.orbitEquation(2, 0, (ω + Orbital.πhalf) * (i - 1) / 49, inclination, ω, Ω); 
          emit(coordinates[0], coordinates[1], coordinates[2]);
        }
      }
    }
  })
  .line({
    color:  0xee3333,
    opacity: 0.8,
    points: '<',
    depth: 0.5,
    width:6,
    zOrder: -1010 + Orbital.z_index,
    id: 'orbit_angle_1_' + Orbital.z_index,
    classes: ['widget', 'labels', 'orbit_' + Orbital.z_index, 'orbit_vis_' + Orbital.z_index]   
  })
  .array({
    width: 52,
    channels: 3,
    classes: ['widget', 'orbit_' + Orbital.z_index],
    expr: function(emit, i, t){
      var ω          = Orbital.deg_to_rad * slider_ω.data('label').text() * 1 - Orbital.πhalf;
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      if (i == 0){
        emit(0,0,0);
      } else {
        if (i == 51){
          emit(0,0,0);
        } else {
          var coordinates = Orbital.orbitEquation(2, 0, Orbital.πhalf + Ω * (i - 1) / 49, 0, 0, Ω); 
          emit(coordinates[0], coordinates[1], coordinates[2]);
        }
      }
    }
  })
  .line({
    color:  0x33ee33,
    opacity: 0.8,
    points: '<',
    depth: 0.5,
    width:6,
    zOrder: -1010 + Orbital.z_index,
    id: 'orbit_angle_2_' + Orbital.z_index,
    classes: ['widget', 'labels', 'orbit_' + Orbital.z_index, 'orbit_vis_' + Orbital.z_index]   
  })
  .array({
    width: 52,
    channels: 3,
    classes: ['widget', 'orbit_' + Orbital.z_index],
    expr: function(emit, i, t){
      var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      if (i == 0){
        emit(0,0,0);
      } else {
        if (i == 51){
          emit(0,0,0);
        } else {
          var coordinates = Orbital.orbitEquation(2, 0, 0, inclination * (i - 1) / 49, 0, Ω); 
          emit(coordinates[0], coordinates[1], coordinates[2]);
        }
      }
    }
  })
  .line({
    color:  0x3333ee,
    opacity: 0.8,
    points: '<',
    depth: 0.5,
    width:6,
    zOrder: -1010 + Orbital.z_index,
    id: 'orbit_angle_3_' + Orbital.z_index,
    classes: ['widget', 'labels', 'orbit_' + Orbital.z_index, 'orbit_vis_' + Orbital.z_index]   
  })
  .array({
    width: 1,
    channels: 3,
    classes: ['widget', 'orbit_' + Orbital.z_index],
    expr: function(emit, i, t){
      var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
      var ω          = Orbital.deg_to_rad * slider_ω.data('label').text() * 1 - Orbital.πhalf;
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      var coordinates = Orbital.orbitEquation(2, 0, (ω + Orbital.πhalf) * 0.5, inclination, ω, Ω); 
      emit(coordinates[0], coordinates[1], coordinates[2]);
    }
  })
  .array({
    width:    Orbital.samples,
    channels: 3,
    classes: ['widget', 'orbit_' + Orbital.z_index],
    expr: function (emit, i, t, dt) {
      var a           = slider_a.data('label').text() * 1;
      var e           = slider_e.data('label').text() * 1;
      var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
      var ω           = Orbital.deg_to_rad * slider_ω.data('label').text() * 1 - Orbital.πhalf;
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      var θ           = i * Orbital.sampling_scale;
      var coordinates = Orbital.orbitEquation(a, e, θ, inclination, ω, Ω);
      emit(coordinates[0], coordinates[1], coordinates[2]);
    },
  })
  .line({
    color:  mycolor,
    opacity: temp,
    points: '<',
    width:  3,
    depth: 0.5,
    zOrder: -1000 + Orbital.z_index,
    id: 'orbit_trajectory_' + Orbital.z_index,
    classes: ['widget', 'orbit_' + Orbital.z_index]
  })
  .array({
    width: 1,
    channels: 3,
    expr: function(emit, i, t){
      var a           = slider_a.data('label').text() * 1;
      var e           = slider_e.data('label').text() * 1;
      var inclination = Orbital.deg_to_rad * slider_i.data('label').text() * 1;
      var ω           = Orbital.deg_to_rad * slider_ω.data('label').text() * 1 - Orbital.πhalf;
      var Ω           = Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      var θ           = -Orbital.deg_to_rad * slider_ν.data('label').text() * 1;
      var coordinates = Orbital.orbitEquation(a, e, θ, inclination, ω, Ω);
      /*
      energy_value.html((0.5 / a).toPrecision(2));
      momentum_value.html(Math.sqrt(a * (1 - e * e)).toPrecision(3));
      */
      emit(coordinates[0], coordinates[1], coordinates[2]);
    },
    classes: ['widget', 'orbit_' + Orbital.z_index]
  })
  .point({
    color:  final_color,
    opacity: 1,
    points: '<',
    size:  10,
    depth: 0.5,
    zOrder: -1001 + Orbital.z_index,
    id: 'launch_site_' + Orbital.z_index,
    classes: ['widget', 'orbit_' + Orbital.z_index]
  })
  .array({
    width: 1,
    items: 2,
    channels: 3,
    expr: function (emit, i, t, d){ 
      var orbit_point = getOrbitPoint();     
      var or = orbit_point.ri;
      var ov = orbit_point.vi;
      emit(or[0], or[1], or[2]);
      emit(or[0] + Orbital.velocity_scale * ov[0], or[1] + Orbital.velocity_scale * ov[1], or[2] + Orbital.velocity_scale * ov[2]);   
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .vector({
    color: 0xffffff,
    width: 2,
    end: true,
    classes: ['widget', 'orbit_' + Orbital.z_index]
  })

  if(predicted==false){
    final_color = 0xff0000;
  }
  /*else if(index<(plotLength*2/3)){
    final_color = 0xffaa00;
  }*/
  else{
    final_color = 0xffff00;
  }
  Orbital.z_index += 1;
  //alert(Orbital.z_index);
}

Orbital.toggleOrbitInterface = function(){
  var orbit = $(this).closest('.orbit');
  orbit.toggleClass('closed');
}

Orbital.togglePlane = function(){
  var toggle = $(this);
  var orbit  = $(this).closest('.orbit');
  var name   = orbit.data('name');

  toggle.toggleClass('hidden');
  if (toggle.hasClass('hidden')){
    Orbital.mathbox.select('#orbital_plane_' + name).set('visible', false);
  } else {
    Orbital.mathbox.select('#orbital_plane_' + name).set('visible', true);
  }
}

Orbital.toggleOrbitView = function(){
  var toggle = $(this);
  var orbit  = $(this).closest('.orbit');
  var name   = orbit.data('name');

  toggle.toggleClass('hidden');
  if (toggle.hasClass('hidden')){
    Orbital.mathbox.select('.orbit_vis_' + name).set('visible', false);
  } else {
    Orbital.mathbox.select('.orbit_vis_' + name).set('visible', true);
  } 
}

Orbital.orbitEquation = function(a, e, θ, inclination, ω, Ω){
  var r  = a * (1 - e * e) / (1 - e * Math.cos(θ + π) );
  var x  = r * Math.cos(θ)
  var y  = r * Math.sin(θ);
  var x1 =  x * Math.cos(ω) + y * Math.sin(ω);
  var y1 = -x * Math.sin(ω) + y * Math.cos(ω);
  var x2 = x1 * Math.cos(inclination);
  var y2 = y1;
  var x3 =  x2 * Math.cos(Ω) + y2 * Math.sin(Ω);
  var y3 = -x2 * Math.sin(Ω) + y2 * Math.cos(Ω);
  return([x3, x1 * Math.sin(inclination), y3]);
}

Orbital.selectTimeMultiplier = function(e){
  var multiplier = $(this);
  Orbital.time_multipliers.removeClass('selected');
  multiplier.addClass('selected');
  Orbital.time_scale = multiplier.data('s') * 1;
}


// Camera interface for follow
Orbital.startDrag = function(e){
  if ($(e.target).closest('#content').length){
    return;
  }
  Orbital.start_x   = e.clientX;
  Orbital.start_y   = e.clientY;
  Orbital.initial_x = Orbital.drag_x;
  Orbital.initial_y = Orbital.drag_y;
  
  if (Orbital.following){
    $(document).on('mousemove.orbital', Orbital.followDrag);
  }
}
Orbital.stopDrag = function(e){
  if (Orbital.following){
    $(document).off('mousemove.orbital');
  }
}

Orbital.startTouch = function(e){
  if ($(e.target).closest('#content').length){
    return;
  }
  var touches = e.originalEvent.touches;
  var touch   = touches[0];

  if (touches.length > 1){
    var pdx = touches[0].clientX - touches[1].clientX;
    var pdy = touches[0].clientY - touches[1].clientY;
  
    Orbital.initial_zoom = Orbital.follow_zoom;
    Orbital.pinch_start  = Math.sqrt(pdx * pdx  + pdy * pdy);
  }

  Orbital.start_x   = touch.clientX;
  Orbital.start_y   = touch.clientY;
  Orbital.initial_x = Orbital.drag_x;
  Orbital.initial_y = Orbital.drag_y;
  if (Orbital.following){
    $('canvas').on('touchmove.orbital', Orbital.followTouchMove);
  }
}

Orbital.stopTouch = function(e){
  if (Orbital.following){
    $('canvas').off('touchmove.orbital'); 
  }
}

Orbital.followDrag = function(e){
  Orbital.drag_x = Orbital.initial_x + e.clientX - Orbital.start_x;
  Orbital.drag_y = Orbital.initial_y + e.clientY - Orbital.start_y;
}

Orbital.zoomFollow = function(e){
  Orbital.follow_zoom -= 0.08 * e.deltaY;
}

Orbital.followTouchMove = function(e){ 
  var touches = e.originalEvent.touches;
  var touch   = touches[0];
  
  if (touches.length > 1){
    var pdx = touches[0].clientX - touches[1].clientX;
    var pdy = touches[0].clientY - touches[1].clientY;
  
    Orbital.follow_zoom = Orbital.initial_zoom - (Orbital.pinch_start - Math.sqrt(pdx * pdx  + pdy * pdy)) * 0.01;
  } else {
    Orbital.drag_x = Orbital.initial_x + touch.clientX - Orbital.start_x;
    Orbital.drag_y = Orbital.initial_y + touch.clientY - Orbital.start_y;
  }
}

$(document).ready(function(){
  Orbital.mathbox = mathBox({
    plugins: ['core', 'controls', 'cursor', 'mathbox'],
    controls: {
      klass: THREE.OrbitControls,
    },
  });
  $.ajax({
    type: "GET",
    url: "data.txt",
    dataType: "text",
    success: function(data) {processData(data);}
  });
  if (Orbital.mathbox.fallback) throw "WebGL not supported"

    Orbital.three = Orbital.mathbox.three;
    Orbital.three.renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    Orbital.light = new THREE.AmbientLight(0xcccccc);
    Orbital.three.scene.add(Orbital.light);

    Orbital.camera = Orbital.mathbox.camera({
    proxy: true,
    fov: 60,
    position: [0, 1, 2],
  });

  Orbital.view = Orbital.mathbox.cartesian({
    range: [[-1, 1], [-1, 1], [-1, 1]],
    scale: [1, 1, 1],
  });

  // Init interface
  // Add Earth
  // Sphere
  Orbital.earth_geometry          = new THREE.SphereGeometry(1, 128, 128);
  Orbital.earth_material          = new THREE.MeshPhongMaterial();
  Orbital.earth_mesh              = new THREE.Mesh(Orbital.earth_geometry, Orbital.earth_material);
  Orbital.earth_material.map      = THREE.ImageUtils.loadTexture('images/earthmap10k.jpg', {}, Orbital.initInterface);
  Orbital.earth_material.specular = new THREE.Color('grey');
  Orbital.three.scene.add(Orbital.earth_mesh);
});

Orbital.initInterface = function(){ 
  Orbital.time_multipliers = $('.time_multiplier');
  Orbital.dt               = $('#dt');
  //Orbital.sound            = $('#sound_toggle');

  //Orbital.sound.on('click', Orbital.toggleSound);
  $(document).on('keydown', Orbital.moveSelectedPoint);
  $(document).on('mousedown', Orbital.startDrag);
  $(document).on('mouseup', Orbital.stopDrag);
  $(document).on('touchstart', Orbital.startTouch);
  $(document).on('touchstop', Orbital.stopTouch);

  
  //$('#play').on('click', Orbital.togglePlay);
  $('#labels_toggle').on('click', Orbital.toggleAxis);
  $('#navigate').on('click', callCreateOrbit);
  $('#predict').on('click', readPredicted);
  $('#help_toggle').on('click', Orbital.toggleHelp);
  $('#restart').on('click', Orbital.restart);
  $('#add_orbit').on('click', Orbital.createOrbit);
  //$('#add_launch').on('click', Orbital.createLaunch);
  $('#close_share_url').on('click', Orbital.closeShareUrl);

  //Orbital.time_multipliers.on('click', Orbital.selectTimeMultiplier);
  Orbital.setupEquatorialPlane();
  
  $('#spinner').fadeOut(function(){
    $(this).remove();
  });

  var params = document.location.href.split('?');
  if (params.length > 1){
    var params = decodeURIComponent(params[1]).split('&');
    if (params.length > 0){
      var name   = params[0].split('=')[1];
      $('.graph .point').removeClass('active');
      Orbital.selectTimeMultiplier.call($('#time_multiplier_' + params[7].split('=')[1]));
    }
  }
}

Orbital.setupEquatorialPlane = function(){
  // Equatorial plane
  Orbital.view.area({
    width: 8,
    height: 8,
    rangeX: [-10, 10],
    rangeY: [-10, 10],
    expr: function (emit, x, y, i, j, t, dt) {
      if (i == 0 && j == 0){
        var sdt = dt * Orbital.time_scale;
        if (!Orbital.pause){
          Orbital.earth_φ += sdt * Orbital.second_rotation;
          Orbital.earth_mesh.rotation.y = Orbital.earth_φ;
          Orbital.dt.html(sdt.toFixed(3) + 's');
        }
      }
      emit(x, 0, y);
    },
    channels: 3,
  })
  .surface({
    color: 0x5599ff,
    opacity:0.25,
    zOrder: 1,
    id: 'equatorial_plane'
  })
  .axis({
    color: 0xffffff,
    range: [-5, 5],
    width: 7,
    classes: ['labels']
  })
  .axis({
    axis: 2,
    color: 0xffffff,
    range: [-5, 5],
    width: 7,
    classes: ['labels']
  })
  .axis({
    axis: 3,
    color: 0xffffff,
    range: [-5, 5],
    width: 7,
    classes: ['labels']
  });
}