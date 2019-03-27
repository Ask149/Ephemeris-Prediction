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
var index = 0;

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

function callCreateOrbit(){
  console.log(axs.length);
  for(var i=0;i<axs.length;i++){
    
    $("#add_orbit").click();
    // same thing, using await syntax
    setTimeout(function(){
    console.log(axs[i]+" "+ecc[i]+" "+inc[i]+" "+bog[i]+" "+sog[i]+" "+man[i]);
    }, 1500);
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
        if(headers[j]=="prn") {
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
  /*var prevButton = $('.close');
  if(prevButton.length>1)
  {
    prevButton[0].click();
  }*/
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

Orbital.createLaunch = function(){
  var input = $('#launch_name');
  Orbital.addLaunch(input.val());
  input.val('');
}

Orbital.togglePlay = function(){
  var play = $(this);
  play.toggleClass('pause');
  if (play.hasClass('pause')){
    Orbital.pause = true;
    $('.launch').each(Orbital.muteLaunch);
  } else {
    Orbital.pause = false;
    $('.launch').each(Orbital.unMuteLaunch);
  }
}

Orbital.toggleSound = function(){
  var toggle = $(this);
  toggle.toggleClass('selected');
  $('.launch').each(Orbital.toggleLaunchSound);
}

Orbital.muteLaunch = function(){
  $(this).data('audio').pause();
}

Orbital.unMuteLaunch = function(){
  var launch = $(this);
  if (launch.data('playing')){
    launch.data('audio').play();
  }
}

Orbital.toggleLaunchSound = function(){
  var launch = $(this);
  if (Orbital.sound.hasClass('selected')){
    launch.data('audio').pause();
  } else {
    if (launch.data('playing')){
      launch.data('audio').play();
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
  $('.orbit, .launch').remove();
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
  var edit_button      = $('<img src="static/js/edit.svg" class="edit_button">');
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
  Orbital.mathbox.select('.orbit_' + name + ', .launch_site_' + name).remove();
  orbit.remove();
  if (orbit.data('follow')){
    $('canvas').off('mousewheel.orbital');
    $('canvas').off('mousemove.orbital');
    $('canvas').off('touchmove.orbital');
  }
}

Orbital.addLaunch = function(name){ 
  var launch             = $('<div class="orbit launch"></div>');
  var controls           = $('<div class="controls"></div>');
  var burns              = $('<div class="burns"></div>');
  var label              = $('<h2><span class="name">' + name + '</span></h2>');
  var close              = $('<div class="close">×</div>');
  var minimize           = $('<div class="minimize_arrow"></div>');
  var hide_plane         = $('<div class="hide_plane"></div>');
  var hide_burn          = $('<div class="hide_burn"></div>');
  var open_presets       = $('<div class="open_presets"></div>');
  var follow             = $('<div class="follow"></div>');

  var height_container   = $('<span class="launch_value_container"><span>h=</span><span class="launch_value">0</span>km</span>');
  var velocity_container = $('<span class="launch_value_container"><span>v=</span><span class="launch_value">0</span>m/s</span>');
  var accel_container    = $('<span class="launch_value_container"><span>&nbsp;a=</span><span class="launch_value">0</span>g</span>');
  var thrust_container   = $('<span class="launch_value_container"><span>at=</span><span class="launch_value">0</span>g</span>');
  var energy_container   = $('<span class="launch_value_container"><span>ε=</span><span class="launch_value">0</span>gr</span>');
  var momentum_container = $('<span class="launch_value_container"><span>&nbsp;H=</span><span class="launch_value">0</span>√(gr)r</span>');
  var a_container        = $('<span class="launch_value_container"><span>a=</span><span class="launch_value">0</span></span>');
  var e_container        = $('<span class="launch_value_container"><span>&nbsp;e=</span><span class="launch_value">0</span></span>');
  var i_container        = $('<span class="launch_value_container"><span>i=</span><span class="launch_value">0</span>°</span>');
  var ω_container        = $('<span class="launch_value_container"><span>ω=</span><span class="launch_value">0</span>°</span>');

  var height_value       = height_container.find('.launch_value');
  var velocity_value     = velocity_container.find('.launch_value');
  var accel_value        = accel_container.find('.launch_value');
  var thrust_value       = thrust_container.find('.launch_value');
  var energy_value       = energy_container.find('.launch_value');
  var momentum_value     = momentum_container.find('.launch_value');
  var a_value            = a_container.find('.launch_value');
  var e_value            = e_container.find('.launch_value');
  var i_value            = i_container.find('.launch_value');
  var ω_value           = ω_container.find('.launch_value');

  var presets            = $('<ul class="presets"></ul>');
  var fire               = $('<div class="add_button burn_toggleable fire"><span class="inactive">fire</span><span class="active">firing <img src="static/js/burn.svg"/></span></div>');
  var trajectory_lock    = $('<div class="add_button burn_toggleable trajectory_lock"><span class="inactive">plane lock</span><span class="active">trajectory lock</span></div>');
  var share_url          = $('<div class="add_button share_url">share url</div>');
  var audio              = $('<audio loop><source src="audio/f9r.mp3" type="audio/mpeg"></audio>');
  var crash              = $('<audio><source src="audio/crash.mp3" type="audio/mpeg"></audio>');
  var name               = label.find('.name');

  var vt  = Orbital.addGraph('vt');
  var vo  = Orbital.addGraph('vo');
  var vr  = Orbital.addGraph('vr');
  
  var p1  = $('<li data-lat="28.46675" data-lng="-80.55852">Cape Canaveral</li>');
  var p2  = $('<li data-lat="28.6082" data-lng="-80.6040">Kennedy Space Center</li>');
  var p3  = $('<li data-lat="34.77204" data-lng="-120.60124">Vandenberg Air Force Base</li>');
  var p4  = $('<li data-lat="37.84621" data-lng="-75.47938">Wallops Flight Facility</li>');
  var p5  = $('<li data-lat="32.56460" data-lng="-106.35908">White Sands Missile Range</li>');
  var p6  = $('<li data-lat="45.95515" data-lng="63.35028">Baikonur Cosmodrome</li>');
  var p7  = $('<li data-lat="5.23739" data-lng="-52.76950">Guiana Space Centre</li>');
  var p8  = $('<li data-lat="30.39096" data-lng="130.96813">Tanegashima Space Center</li>');
  var p9  = $('<li data-lat="41.11803" data-lng="100.46330">Jiuquan Satellite Launch Center</li>');
  var p10 = $('<li data-lat="13.73740" data-lng="80.23510">Satish Dhawan Space Centre</li>');
  
  var r       = [0, 0, 0];
  var v       = [0, 0, 0];
  var t_t     = [0, 0, 0]; 
  var t_r     = [0, 0, 0]; 
  var t_n     = Orbital.planeNormal(0, 0);
  var thrust  = [0, 0, 0];
  var acc     = [0, 0, 0];
  var v_earth = [0, 0, 0];
  var k1      = [0, 0, 0];
  var k2      = [0, 0, 0];
  var k3      = [0, 0, 0];
  var k4      = [0, 0, 0];
  var l1      = [0, 0, 0];
  var l2      = [0, 0, 0];
  var l3      = [0, 0, 0];
  var l4      = [0, 0, 0];
  
  var h         = 0;
  var vn        = 0;
  var rn        = 0;
  var i_inst    = 0;
  var i_fixed   = 0;
  var Ω_inst    = 0;
  var node_norm = 0;

  var setFixedInclination = function(inc){
    i_fixed = inc;
    i_inst  = inc;
  }

  var updateInclination = function(e, ui){
    var slider = $(this);
    if (ui){
      slider.data('label').html(ui.value);
    } else {
      slider.data('label').html(slider.slider('value'));
    }
    var φ = Orbital.deg_to_rad * launch.data('slider_φ').data('label').text() * 1;
    var λ = Orbital.deg_to_rad * launch.data('slider_λ').data('label').text() * 1;
    var Ω = Orbital.deg_to_rad * launch.data('slider_Ω').data('label').text() * 1
    i_fixed = Orbital.getInclination(
                Orbital.normalize([Math.cos(φ) * Math.cos(λ), Math.sin(φ), Math.cos(φ) * Math.sin(λ)]), 
                [Math.cos(-Ω - Orbital.πhalf), 0, Math.sin(-Ω - Orbital.πhalf)], 
                φ);
    i_inst  = i_fixed;
  }

  var slider_container_Ω = Orbital.createControl('Ω', [0, 360], '°', 0.2, { handler: updateInclination});
  var slider_container_φ = Orbital.createControl('φ', [-90, 90], '°', 0.2, { handler: updateInclination});
  var slider_container_λ = Orbital.createControl('λ', [-180, 180], '°', 0.2, { handler: updateInclination});
 
  var trajectory        = Array(Orbital.trajectory_n);
  var trajectory_colors = Array(Orbital.trajectory_n);
  var trajectory_i      = 0;
  var trajectory_offset = 0;
  for (var l = 0; l < Orbital.trajectory_n; l++){
    trajectory[l] = 0;
    trajectory_colors[l] = [0, 0, 0];
  }
  var launch_t      = 0;
  var launch_t_last = 0;
  var t0            = false;
  var tf            = 0;
  var tf2           = 0;
  var energy        = 0;
  var momentum      = 0;
  var a_inst        = 0;
  var e_inst        = 0;
  var ω_inst        = 0;
  var ν_inst        = 0;
  var p_inst        = 0;
  var hv            = 0;
  var lock_to_trajectory = false;
  var node;

  var setTrajectoryLock = function(state){
    lock_to_trajectory = state;
  }

  presets.append(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10);   
  controls.append(slider_container_Ω, slider_container_φ, slider_container_λ);
  launch.append(
    label, controls, burns, close, minimize, hide_plane, hide_burn,
    vt, vr, vo,
    open_presets, follow, presets, fire, trajectory_lock, share_url, 
    audio, crash,
    height_container, accel_container, velocity_container, thrust_container, 
    energy_container, momentum_container, e_container, a_container, i_container, ω_container
  );

  audio = audio[0];
  crash = crash[0];

  var slider_Ω = slider_container_Ω.data('slider');
  var slider_φ = slider_container_φ.data('slider');
  var slider_λ = slider_container_λ.data('slider');

  launch.data({
    lat:          slider_φ,
    lng:          slider_λ,
    slider_Ω:     slider_Ω,
    slider_φ:     slider_φ,
    slider_λ:     slider_λ,
    t0:           false,
    firing:       false,
    playing:      false,
    launched:     false,
    follow:       false,
    name:         Orbital.z_index,
    namefield:    name,
    audio:        audio,
    presettoggle: open_presets,
    setFixedInclination: setFixedInclination,
    setTrajectoryLock: setTrajectoryLock
  });
  launch.droppable({
    drop: Orbital.launchOrbit,
    hoverClass: 'adding_orbit'
  });

  vt.addClass('active');
  follow.addClass('selected');
  close.on('click', Orbital.removeInterface);
  hide_plane.on('click', Orbital.togglePlane);
  hide_burn.on('click', Orbital.toggleBurn);
  minimize.on('click', Orbital.toggleOrbitInterface);
  name.on('click', Orbital.togglePresets);
  open_presets.on('click', Orbital.togglePresets);
  follow.on('click', Orbital.toggleFollow);
  presets.on('click', Orbital.selectLaunchPreset);
  fire.on('click', Orbital.fireLaunch);
  share_url.on('click', Orbital.showShareUrl);
  trajectory_lock.on('click', Orbital.toggleTrajectoryLock);
  $('.launch').addClass('burn_hidden');
  $('#launches').append(launch);

  var getInstantaneousOrbitalParameters = function(){
    rn = Orbital.norm(r);
    vn = Orbital.norm(v);
    h  = Orbital.r0k * (Orbital.norm(r) - 1);
   
    if (h < 0 && launch.data('launched')){
      launch.data('launched', false);
      crash.play();
    }
    h = Math.abs(h);
    if (h < 0.0001){
      h = 0;
    }

    energy     = Orbital.tr_scale_inv2 * vn * vn - 1 / rn;
    hv         = Orbital.crossProduct(r, v);
    hvn        = Orbital.normalize(hv);
    momentum   = Orbital.tr_scale_inv_sq * Orbital.norm(hv);
    a_inst     = -0.5 / energy;
    e_inst     = Math.sqrt(1 + 2 * energy * momentum * momentum);
    p_inst = a_inst * (1 - e_inst * e_inst); 
    var trv = Orbital.scalarProduct(t_r, v);
    if (trv != 0){ 
      ν_inst = Math.acos((p_inst / rn - 1) / e_inst); 
      if (trv < 0){
        ν_inst = Orbital.twoπ - ν_inst;
      }
    }

    node      = Orbital.crossProduct([0, 1, 0], hvn);
    node_norm = Orbital.norm(node);
    if (node_norm == 0){
      i_inst = 0;
      if (i_inst >= 0){
        if (i_inst > Orbital.πhalf){
          i_inst = 180;      
        }
        Ω_inst = 0;
      } else {
        if (i_inst < -Orbital.πhalf ){
          i_inst = -180;      
        }   
        Ω_inst = π;
      }
    } else {
      node = [node[0] / node_norm, node[1] / node_norm, node[2] / node_norm];
      i_inst = Math.acos(Orbital.scalarProduct(hvn, [0, 1, 0]));
      Ω_inst = Math.acos(node[2]);
      if (node[0] < 0){
        Ω_inst = Orbital.twoπ - Ω_inst;
      }
      ω_inst = Math.acos(Orbital.scalarProduct(t_r, node));
      if (Orbital.scalarProduct(t_r, Orbital.crossProduct(hvn, node)) < 0){
        ω_inst = Orbital.twoπ - ω_inst; 
      }
      ω_inst = ω_inst - ν_inst;
      if (ω_inst < 0){
        ω_inst += Orbital.twoπ;
      }
    }
  }

  var insertIntoOrbit = function(ri, vi, φ, λ, Ω){
    slider_Ω.slider('value', Orbital.rad_to_deg * Ω);
    slider_φ.slider('value', Orbital.rad_to_deg * φ);
    slider_λ.slider('value', Orbital.rad_to_deg * λ);
 
    r[0] = ri[0];
    r[1] = ri[1];
    r[2] = ri[2];
    v[0] = vi[0];
    v[1] = vi[1];
    v[2] = vi[2];
    lock_to_trajectory = true;
    trajectory_lock.addClass('toggled');
    getInstantaneousOrbitalParameters();
    i_fixed = i_inst;
    launch.data('launched', true);


    follow.removeClass('selected');
    $('.launch').not(launch).each(Orbital.turnOffFollowing);
    launch.data('follow', true);
    Orbital.following = launch;
    $('canvas').on('mousewheel.orbital', Orbital.zoomFollow);
  }

  var getPosition = function(){
    return(r);
  }

  var setViewPosition = function(rset){
    if (!rset){
      rset = [r[0], r[1], r[2]];
    }
    Orbital.camera.set('position', [rset[0] * 1.52, rset[1] * 1.5, rset[2] * 1.5]);
  }

  var resetTimeMarkers = function(){
    vt.data('time_marker').css('left', 0);
    vo.data('time_marker').css('left', 0);
    vr.data('time_marker').css('left', 0);
  }

  var getUrl = function(){
    params = [];
    params.push('name=' + name.text());
    params.push('Omega=' + slider_Ω.data('label').text());
    params.push('lat=' + slider_φ.data('label').text());
    params.push('lng=' + slider_λ.data('label').text());
    var vt_points = [];
    var vo_points = [];
    var vr_points = [];
    
    vt.find('.point').each(function(){
      var position = $(this).position();
      vt_points.push(position.left * 1 + ':' + position.top * 1);
    });

    vo.find('.point').each(function(){
      var position = $(this).position();
      vo_points.push(position.left * 1 + ':' + position.top * 1);
    });
    
    vr.find('.point').each(function(){
      var position = $(this).position();
      vr_points.push(position.left * 1 + ':' + position.top * 1);
    });

    params.push('vt=' + vt_points.join('|'));
    params.push('vo=' + vo_points.join('|'));
    params.push('vr=' + vr_points.join('|'));
    params.push('tx=' + $('.time_multiplier.selected').data('s'));
    return('https://orbitalmechanics.info?' + params.join('&'));
  }

  launch.data('insertIntoOrbit', insertIntoOrbit);
  launch.data('getPosition', getPosition);
  launch.data('setViewPosition', setViewPosition);
  launch.data('resetTimeMarkers', resetTimeMarkers);
  launch.data('getUrl', getUrl);
  launch.data('vt', vt);
  launch.data('vo', vo);
  launch.data('vr', vr);

  Orbital.orbits[Orbital.z_index] = launch;

  Orbital.view.area({
    width: 8,
    height: 8,
    rangeX: [-10, 10],
    rangeY: [-10, 10],
    expr: function (emit, x, y, i, j, time) {
      var Ω           = lock_to_trajectory ? Ω_inst : Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      var inclination = lock_to_trajectory ? i_inst : i_fixed;

      var x1 = x * Math.cos(inclination);
      var y1 = y;
      var x2 =  x1 * Math.cos(Ω) + y1 * Math.sin(Ω);
      var y2 = -x1 * Math.sin(Ω) + y1 * Math.cos(Ω);
      emit(x2, x * Math.sin(inclination), y2);
    },
    channels: 3,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .surface({
    points: '<',
    color: 0x00cc44,
    opacity:0.55,
    zOrder: Orbital.z_index + 1000,
    classes: ['widget', 'launch_site_' + Orbital.z_index],
    id: 'orbital_plane_' + Orbital.z_index
  })
  .array({
    width:    Orbital.samples,
    channels: 3,
    classes: ['widget', 'launch_site_' + Orbital.z_index],
    expr: function (emit, i, t, dt) {
      var θ           = i * Orbital.sampling_scale;
      var coordinates = Orbital.orbitEquation(a_inst, e_inst, θ, i_inst, ω_inst - Orbital.πhalf, Ω_inst);
      emit(coordinates[0], coordinates[1], coordinates[2]);
    },
  })
  .line({
    color:  0x0000ff,
    opacity: 0.8,
    points: '<',
    width:  2,
    depth: 0.5,
    zOrder: -1000 + Orbital.z_index,
    id: 'launch_orbit_' + Orbital.z_index,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .array({
    width: 1,
    channels: 3,
    expr: function (emit, i, t, d) {
      var plane_t     = launch.data('t0') ? launch.data('t0') : t;
      var φ           = Orbital.deg_to_rad * slider_φ.data('label').text() * 1;
      var λ           = -Orbital.deg_to_rad * slider_λ.data('label').text() * 1 - plane_t * Orbital.second_rotation * Orbital.time_scale;
      var Ω           = lock_to_trajectory ? Ω_inst : Orbital.deg_to_rad * slider_Ω.data('label').text() * 1;
      var inclination = lock_to_trajectory ? i_inst : i_fixed;
      var vt_v, vo_v, vr_v, tv;
      
      var dt = d * Orbital.time_scale;

      Orbital.current_time = t;

      // If burn fireed get thrust values

      if (launch.data('firing')){
        if (launch.data('t0') == false){
          // If burn just started set initial time
          launch.data('t0', launch_t);
        }

        tf  = launch_t - launch.data('t0');
        tf2 = tf * 2;

        // Update display values        
        vt.data('time_marker').css('left', tf2);
        vo.data('time_marker').css('left', tf2);
        vr.data('time_marker').css('left', tf2);

        // Get thrust values
        vt_v = Orbital.getGraphValue(vt, tf);
        vo_v = Orbital.getGraphValue(vo, tf);
        vr_v = Orbital.getGraphValue(vr, tf);
        tv   = Math.sqrt(vt_v * vt_v + vo_v * vo_v + vr_v * vr_v);

        if (tv > 0){
          launch.data('launched', true);
          audio.volume = 0.1 * tv;
          if (!launch.data('playing') && !Orbital.sound.hasClass('selected') && launch.data('firing')){
            audio.play();
            launch.data('playing', true);
          }
        } else {
          if (launch.data('playing')){
            audio.pause();
            launch.data('playing', false);
          }
        }
      } else {
        vt_v = 0;
        vo_v = 0;
        vr_v = 0;
      }

      // Get earth speed and coordinate system

      v_earth[0] = Math.cos(φ) * Math.sin(λ) * Orbital.equatorial_speed;
      v_earth[1] = 0;
      v_earth[2] = -Math.cos(φ) * Math.cos(λ) * Orbital.equatorial_speed;
      
      t_r = Orbital.normalize(r);
      t_n = Orbital.planeNormal(inclination, Ω);
      t_t = Orbital.normalize(Orbital.crossProduct(t_n, t_r));

      if (!launch.data('launched')){
        r[0] = Math.cos(φ) * Math.cos(λ);
        r[1] = Math.sin(φ);
        r[2] = Math.cos(φ) * Math.sin(λ);
        v[0] = v_earth[0];
        v[1] = v_earth[1];
        v[2] = v_earth[2];
        acc[0] = 0;
        acc[1] = 0;
        acc[2] = 0;
      } else {
        if (!Orbital.pause){
          vt_v2  = Orbital.getGraphValue(vt, tf + dt * 0.5);
          vo_v2  = Orbital.getGraphValue(vo, tf + dt * 0.5);
          vr_v2  = Orbital.getGraphValue(vr, tf + dt * 0.5);
          vt_vdt = Orbital.getGraphValue(vt, tf + dt);
          vo_vdt = Orbital.getGraphValue(vo, tf + dt);
          vr_vdt = Orbital.getGraphValue(vr, tf + dt);

          thrust[0] = vt_v * t_r[0] + vr_v * t_t[0] + vo_v * t_n[0];
          thrust[1] = vt_v * t_r[1] + vr_v * t_t[1] + vo_v * t_n[1];
          thrust[2] = vt_v * t_r[2] + vr_v * t_t[2] + vo_v * t_n[2];

          var f = Orbital.force(r);

          acc[0] = f[0] + thrust[0];
          acc[1] = f[1] + thrust[1];
          acc[2] = f[2] + thrust[2];

          // RK1
          k1[0] = dt * v[0];
          k1[1] = dt * v[1];
          k1[2] = dt * v[2];
        
          l1[0] = dt * Orbital.tr_scale * (f[0] + thrust[0]);
          l1[1] = dt * Orbital.tr_scale * (f[1] + thrust[1]);
          l1[2] = dt * Orbital.tr_scale * (f[2] + thrust[2]);
         
          // RK2
          f = Orbital.force([r[0] + 0.5 * k1[0], r[1] + 0.5 * k1[1], r[2] + 0.5 * k1[2]]);
          k2[0] = dt * (v[0] + 0.5 * l1[0]);
          k2[1] = dt * (v[1] + 0.5 * l1[1]);
          k2[2] = dt * (v[2] + 0.5 * l1[2]);
        
          l2[0] = dt * Orbital.tr_scale * (f[0] + vt_v2 * t_r[0] + vr_v2 * t_t[0] + vo_v2 * t_n[0]);
          l2[1] = dt * Orbital.tr_scale * (f[1] + vt_v2 * t_r[1] + vr_v2 * t_t[1] + vo_v2 * t_n[1]);
          l2[2] = dt * Orbital.tr_scale * (f[2] + vt_v2 * t_r[2] + vr_v2 * t_t[2] + vo_v2 * t_n[2]);
       
          // RK3
          f = Orbital.force([r[0] + 0.5 * k2[0], r[1] + 0.5 * k2[1], r[2] + 0.5 * k2[2]]);
          k3[0] = dt * (v[0] + 0.5 * l2[0]);
          k3[1] = dt * (v[1] + 0.5 * l2[1]);
          k3[2] = dt * (v[2] + 0.5 * l2[2]);
        
          l3[0] = dt * Orbital.tr_scale * (f[0] + vt_v2 * t_r[0] + vr_v2 * t_t[0] + vo_v2 * t_n[0]);
          l3[1] = dt * Orbital.tr_scale * (f[1] + vt_v2 * t_r[1] + vr_v2 * t_t[1] + vo_v2 * t_n[1]);
          l3[2] = dt * Orbital.tr_scale * (f[2] + vt_v2 * t_r[2] + vr_v2 * t_t[2] + vo_v2 * t_n[2]);

          // RK3
          f = Orbital.force([r[0] + k3[0], r[1] + k3[1], r[2] + k3[2]]);
          k4[0] = dt * (v[0] + l3[0]);
          k4[1] = dt * (v[1] + l3[1]);
          k4[2] = dt * (v[2] + l3[2]);
        
          l4[0] = dt * Orbital.tr_scale * (f[0] + vt_vdt * t_r[0] + vr_vdt * t_t[0] + vo_vdt * t_n[0]);
          l4[1] = dt * Orbital.tr_scale * (f[1] + vt_vdt * t_r[1] + vr_vdt * t_t[1] + vo_vdt * t_n[1]);
          l4[2] = dt * Orbital.tr_scale * (f[2] + vt_vdt * t_r[2] + vr_vdt * t_t[2] + vo_vdt * t_n[2]);

          r[0] = r[0] + (k1[0] + 2 * (k2[0] + k3[0]) + k4[0])/6;
          r[1] = r[1] + (k1[1] + 2 * (k2[1] + k3[1]) + k4[1])/6;
          r[2] = r[2] + (k1[2] + 2 * (k2[2] + k3[2]) + k4[2])/6;
          v[0] = v[0] + (l1[0] + 2 * (l2[0] + l3[0]) + l4[0])/6;
          v[1] = v[1] + (l1[1] + 2 * (l2[1] + l3[1]) + l4[1])/6;
          v[2] = v[2] + (l1[2] + 2 * (l2[2] + l3[2]) + l4[2])/6;

          // Update trajectory
          if (Math.floor(launch_t / Orbital.trajectory_density) != launch_t_last){
            if (trajectory_i == Orbital.trajectory_n){
              trajectory_i = 0;
            }
            trajectory[trajectory_i] = [r[0], r[1], r[2]];
            if (tv > 0){
              trajectory_colors[trajectory_i] = [tv / 8.7, 0, 0];
            } else {
              trajectory_colors[trajectory_i] = [1, 1, 1]; 
            }
            trajectory_i++;
          }

          launch_t_last = Math.floor(launch_t / Orbital.trajectory_density);
        }
      }
      
      getInstantaneousOrbitalParameters();

      height_value.html(h.toPrecision(5));
      velocity_value.html((Orbital.r0 * vn).toPrecision(5));
      accel_value.html(Orbital.norm(acc).toPrecision(5));
      thrust_value.html(Orbital.norm(thrust).toPrecision(5));
      energy_value.html(energy.toPrecision(2));
      momentum_value.html(momentum.toPrecision(3));
      e_value.html(e_inst.toPrecision(2));
      a_value.html(a_inst.toPrecision(3));
      i_value.html((Orbital.rad_to_deg * inclination).toPrecision(4));
      ω_value.html((Orbital.rad_to_deg * ω_inst).toPrecision(4));

      if (launch.data('follow')){
        var χ  = Orbital.drag_x;
        var nn = Orbital.rotateByAxis(t_n, t_r, -χ * 0.004);

        Orbital.camera.set('lookAt', r);
        Orbital.camera.set('position', 
          [
            r[0] + nn[0] * 0.15 * Orbital.follow_zoom + t_r[0] * Orbital.drag_y * 0.0005, 
            r[1] + nn[1] * 0.15 * Orbital.follow_zoom + t_r[1] * Orbital.drag_y * 0.0005, 
            r[2] + nn[2] * 0.15 * Orbital.follow_zoom + t_r[2] * Orbital.drag_y * 0.0005
          ]
        );
        Orbital.camera.set('up', t_r);
      }

      // Don't increment time if paused
      
      if (!Orbital.pause){
        launch_t += dt;
      }

      emit(r[0], r[1], r[2]);
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .point({
    color:  0xff0000,
    opacity: 0.8,
    points: '<',
    size:  6,
    depth: 0.5,
    zOrder: -1001 + Orbital.z_index,
    id: 'launch_site_' + Orbital.z_index,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .array({
    width: 1,
    items: 2,
    channels: 3,
    expr: function (emit, i, t, d){
      emit(r[0], r[1], r[2]);
      emit(r[0] + Orbital.axis_scale * t_n[0], r[1] + Orbital.axis_scale * t_n[1], r[2] + Orbital.axis_scale * t_n[2]);   
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .vector({
    color: 0xffffff,
    width: 0.2,
    end: true,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .array({
    width: 1,
    items: 2,
    channels: 3,
    expr: function (emit, i, t, d){      
      emit(r[0], r[1], r[2]);
      emit(r[0] + Orbital.axis_scale * t_r[0], r[1] + Orbital.axis_scale * t_r[1], r[2] + Orbital.axis_scale * t_r[2]);   
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .vector({
    color: 0xffffff,
    width: 0.2,
    end: true,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .array({
    width: 1,
    items: 2,
    channels: 3,
    expr: function (emit, i, t, d){      
      emit(r[0], r[1], r[2]);
      emit(r[0] + Orbital.axis_scale * t_t[0], r[1] + Orbital.axis_scale * t_t[1], r[2] + Orbital.axis_scale * t_t[2]);   
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .vector({
    color: 0xffffff,
    width: 0.2,
    end: true,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .array({
    width: 1,
    items: 2,
    channels: 3,
    expr: function (emit, i, t, d){      
      emit(r[0], r[1], r[2]);
      emit(r[0] + Orbital.thrust_scale * thrust[0], r[1] + Orbital.thrust_scale * thrust[1], r[2] + Orbital.thrust_scale * thrust[2]);   
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .vector({
    color: 0xff6600,
    width: 0.2,
    end: true,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .array({
    width: 1,
    items: 2,
    channels: 3,
    expr: function (emit, i, t, d){      
      emit(r[0], r[1], r[2]);
      emit(r[0] + Orbital.velocity_scale * v[0], r[1] + Orbital.velocity_scale * v[1], r[2] + Orbital.velocity_scale * v[2]);   
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .vector({
    color: 0x66ff66,
    width: 0.2,
    end: true,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .array({
    width: Orbital.trajectory_n,
    channels: 4,
    expr: function (emit, i, t, d){  
      var p;
      if (i < trajectory_i){
        p = trajectory_colors[trajectory_i - 1 - i];
      } else {   
        p = trajectory_colors[Orbital.trajectory_n - 1 - i + trajectory_i];
      }
      emit(p[0], p[1], p[2], 1);
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .array({
    width: Orbital.trajectory_n,
    channels: 3,
    expr: function (emit, i, t, d){  
      var p;
      if (i < trajectory_i){
        p = trajectory[trajectory_i - 1 - i];
      } else {   
        p = trajectory[Orbital.trajectory_n - 1 - i + trajectory_i];
      }
      emit(p[0], p[1], p[2]);
    },
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })
  .line({
    color: 0xffee66,
    colors: '<<',
    points: '<',
    width:  6,
    depth: 0.5,
    zOrder: -990 + Orbital.z_index,
    classes: ['widget', 'launch_site_' + Orbital.z_index]
  })

  Orbital.z_index += 1;

  return(launch);
}

Orbital.launchOrbit = function(e, ui){
  var orbit       = ui.draggable.closest('.orbit');
  var launch      = $(this);
  var orbit_point = orbit.data('getOrbitPoint')();
  var Ω           = Orbital.deg_to_rad * orbit.data('slider_Ω').data('label').text() * 1;
  var inclination = Orbital.deg_to_rad * orbit.data('slider_i').data('label').text() * 1;
  
  var point = Orbital.orbitEquation(1, 0, 0, inclination, 0, Ω);
  var φ     = -Math.asin(point[1]);
  var λ     =  Math.acos(point[0]) + Orbital.current_time * Orbital.second_rotation * Orbital.time_scale;

  launch.data('insertIntoOrbit')(orbit_point.ri, orbit_point.vi, φ, λ, Ω);
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

Orbital.toggleTrajectoryLock = function(){
  var button = $(this);
  var launch = button.closest('.launch');
  button.toggleClass('toggled');
  if (button.hasClass('toggled')){
    launch.data('setTrajectoryLock')(true);
  } else {
    launch.data('setTrajectoryLock')(false);
  }
}

Orbital.showShareUrl = function(){
  $('.point').removeClass('active');
  var launch = $(this).closest('.launch');
  $('#share_url_input').val(launch.data('getUrl')()).focus().select();
  $('#share_url_container').removeClass('hidden');
}

Orbital.closeShareUrl = function(){
  $('#share_url_container').addClass('hidden');
}

Orbital.fireLaunch = function(e){
  var button = $(this);
  var launch = button.closest('.launch');
  button.toggleClass('toggled');
  launch.toggleClass('firing');
  launch.data('firing', launch.hasClass('firing'));
  if (!launch.hasClass('firing')){
    launch.data('t0', false);
    launch.data('playing', false);
    launch.data('audio').pause();
    launch.data('resetTimeMarkers')();
  }
}

Orbital.selectLaunchPreset = function(e){
  var selected = $(e.target);
  var launch   = selected.closest('.launch');

  Orbital.setLaunchPreset(launch, selected.text(), selected.data('lat') * 1, selected.data('lng') * 1);
}

Orbital.setLaunchPreset = function(launch, name, lat_set, lng_set, Ω_set){
  var lat      = launch.data('lat');  
  var lng      = launch.data('lng');

  launch.find('h2 .name').html(name);
  launch.find('.presets, .open_presets').removeClass('open');
  lat.slider('option', 'value', lat_set);
  lng.slider('option', 'value', lng_set);
  Orbital.updateSliderLabel.call(lat);
  Orbital.updateSliderLabel.call(lng); 

  var φ = Orbital.deg_to_rad * lat.data('label').text() * 1;
  var λ = -Orbital.deg_to_rad * lng.data('label').text() * 1 - Orbital.current_time * Orbital.second_rotation * Orbital.time_scale;
  var Ω = Orbital.deg_to_rad * launch.data('slider_Ω').data('label').text() * 1;
  if (Ω_set != undefined){
    launch.data('slider_Ω').slider('value', Ω_set);
    Ω = Ω_set;
  }
  var r = [Math.cos(φ) * Math.cos(λ), Math.sin(φ), Math.cos(φ) * Math.sin(λ)];
  launch.data('setFixedInclination')(Orbital.getInclination(r, [Math.cos(-Ω - Orbital.πhalf), 0, Math.sin(-Ω - Orbital.πhalf)]));
  launch.data('setViewPosition')(r);
}

Orbital.togglePresets = function(e){
  var toggle = $(this).closest('.launch').data('presettoggle');
  toggle.toggleClass('open');
  toggle.closest('.launch').find('.presets').toggleClass('open');
}

Orbital.toggleBurn = function(){
  var launch = $(this).closest('.launch');
  if (launch.hasClass('burn_hidden')){
    $('.launch').addClass('burn_hidden');
    launch.removeClass('burn_hidden');
  } else {
    launch.addClass('burn_hidden');
  }
}

Orbital.toggleFollow = function(){
  var toggle = $(this);
  var launch = toggle.closest('.launch');
  toggle.toggleClass('selected');
  if (toggle.hasClass('selected')){
    launch.data('follow', false);
    Orbital.following = false;
    $('canvas').off('mousewheel.orbital');
    launch.data('setViewPosition')();
    Orbital.camera.set('lookAt', [0, 0, 0]); 
    Orbital.camera.set('up', [0, 1, 0]);
  } else {
    $('.launch').not(launch).each(Orbital.turnOffFollowing);
    launch.data('follow', true);
    Orbital.following = launch;
    $('canvas').on('mousewheel.orbital', Orbital.zoomFollow);
  }
}

Orbital.turnOffFollowing = function(){
  var launch = $(this);
  launch.find('.follow').addClass('selected');
  launch.data('follow', false);
  Orbital.following = false;
}

////////////
// Orbits //
////////////

Orbital.addOrbit = function(name){
  index = index + 1;
  var slider_container_a = Orbital.createControl('a', [1, 6], '', 0.01, { value : axs[index] });
  var slider_container_e = Orbital.createControl('e', [0, 1], '', 0.01, { value : ecc[index] });
  var slider_container_i = Orbital.createControl('i', [0, 180], '°', 0.2, { value : inc[index]});
  var slider_container_ω = Orbital.createControl('ω', [0, 360], '°', 0.2, { value : sog[index] });
  var slider_container_Ω = Orbital.createControl('Ω', [0, 360], '°', 0.2, { value : bog[index] });
  var slider_container_ν = Orbital.createControl('ν', [0, 360], '°', 0.2, { value : man[index] });
  
  var orbit              = $('<div class="orbit"></div>');
  var controls           = $('<div class="controls"></div>');
  var label              = $('<h2>' + name + '</h2>');
  var close              = $('<div class="close">×</div>');
  var minimize           = $('<div class="minimize_arrow"></div>');
  var hide_plane         = $('<div class="hide_plane"></div>');
  var toggle             = $('<div class="toggle_view"></div>');
  var launch             = $('<div class="add_to_launch"></div>');  
  var energy_container   = $('<span class="launch_value_container"><span>ε=-</span><span class="launch_value">0</span>gr</span>');
  var momentum_container = $('<span class="launch_value_container"><span>&nbsp;H=</span><span class="launch_value">0</span>√(gr)r</span>');
  var energy_value       = energy_container.find('.launch_value');
  var momentum_value     = momentum_container.find('.launch_value');

  var slider_a = slider_container_a.data('slider');
  var slider_e = slider_container_e.data('slider');
  var slider_i = slider_container_i.data('slider');
  var slider_ω = slider_container_ω.data('slider');
  var slider_Ω = slider_container_Ω.data('slider');
  var slider_ν = slider_container_ν.data('slider');

  controls.append(slider_container_a, slider_container_e, slider_container_i, slider_container_ω, slider_container_Ω, slider_container_ν);
  orbit.append(label, controls, close, minimize, hide_plane, toggle, launch, energy_container, momentum_container);

  close.on('click', Orbital.removeInterface);
  hide_plane.on('click', Orbital.togglePlane);
  minimize.on('click', Orbital.toggleOrbitInterface);
  toggle.on('click', Orbital.toggleOrbitView);
  launch.draggable({
    axis: 'y',
    revert: true,
    revertDuration: 200
  });

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
      energy_value.html((0.5 / a).toPrecision(2));
      momentum_value.html(Math.sqrt(a * (1 - e * e)).toPrecision(3));

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

  if(index<axs.length/3){
    final_color = 0xff0000;
  }
  else if(index<axs.length*2/3){
    final_color = 0xffaa00;
  }
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
    url: "/static/js/5.txt",
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
  Orbital.earth_material.map      = THREE.ImageUtils.loadTexture('static/js/earthmap10k.jpg', {}, Orbital.initInterface);
  Orbital.earth_material.specular = new THREE.Color('grey');
  Orbital.three.scene.add(Orbital.earth_mesh);
});

Orbital.initInterface = function(){ 
  Orbital.time_multipliers = $('.time_multiplier');
  Orbital.dt               = $('#dt');
  Orbital.sound            = $('#sound_toggle');

  Orbital.sound.on('click', Orbital.toggleSound);
  $(document).on('keydown', Orbital.moveSelectedPoint);
  $(document).on('mousedown', Orbital.startDrag);
  $(document).on('mouseup', Orbital.stopDrag);
  $(document).on('touchstart', Orbital.startTouch);
  $(document).on('touchstop', Orbital.stopTouch);
  
  $('#play').on('click', Orbital.togglePlay);
  $('#labels_toggle').on('click', Orbital.toggleAxis);
  $('#help_toggle').on('click', Orbital.toggleHelp);
  $('#restart').on('click', Orbital.restart);
  $('#add_orbit').on('click', Orbital.createOrbit);
  $('#add_launch').on('click', Orbital.createLaunch);
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
      Orbital.toggleSound.call(Orbital.sound);
      var name   = params[0].split('=')[1];
      var launch = Orbital.addLaunch(name);
      Orbital.addPointsToGraph(launch.data('vt'), params[4].split('=')[1]);
      Orbital.addPointsToGraph(launch.data('vo'), params[5].split('=')[1]);
      Orbital.addPointsToGraph(launch.data('vr'), params[6].split('=')[1]); 
      Orbital.setLaunchPreset(launch, name, params[2].split('=')[1] * 1, params[3].split('=')[1] * 1, params[1].split('=')[1] * 1);
      $('.graph .point').removeClass('active');
      Orbital.toggleFollow.call(launch.find('.follow'));
      Orbital.fireLaunch.call(launch.find('.fire'));
      Orbital.selectTimeMultiplier.call($('#time_multiplier_' + params[7].split('=')[1]));
    }
  }
  Orbital.play = Orbital.mathbox.play({
    target: 'cartesian',
    loop: true,
    realtime: true
  });
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
