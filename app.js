/*
 * Dot class
 */
function Dot(dotId, dotURI, dotLabel, dotCol) {

  // jQuery best practice ... according to peepcode
  if ( !(this instanceof arguments.callee) ) {
    return new arguments.callee(arguments);
  }

  var self = this;

  // Construction atts
  self.id = dotId;
  self.uri = dotURI
  self.label = dotLabel;
  self.colour = dotCol;
  
  // Calculated atts
  self.xPos = -1;
  self.yPos = -1;
  
  // Associations (raphael paths)
  self.assocs = [];

}

/*
 * Pattern Visualization class
 */
function PatternViz(domID, width, height, techs, patterns, rels) {

  // jQuery best practice ... according to peepcode
  if ( !(this instanceof arguments.callee) ) {
    return new arguments.callee(arguments);
  }

  var self = this;

  var dots = {};

  /* 
   * Initializer
   */
  self.init = function() {
  
    self.paper = Raphael(domID, width, height);
    self.dotRadius = 50;
    self.dotOffset = (self.dotRadius * 2) + 10;
    
    var columns = 3;
	var techX = self.dotRadius + 10;
	var techY = self.dotRadius + 10;
	var pattX = techX + (self.dotOffset * columns) + 50;
	var pattY = self.dotRadius + 10;
	
	// Create dots for techs and patterns
	$(techs).each( function(i, tech) {
	  var dot = new Dot(tech.id, tech.uri, tech.name, "#086fa1");
	  dots[tech.id] = dot;
	  self.layoutDot(i, columns, techX, techY, dot);
	} );    

	$(patterns).each( function(i, pattern) {
	  var dot = new Dot(pattern.id, pattern.uri, pattern.name, "#ff8900");
	  dots[pattern.id] = dot;
	  self.layoutDot(i, columns, pattX, pattY, dot);
	} );    
	
	$(rels).each( function(i, rel) {	
	  for (techID in rel) {
	    var pattID = rel[techID];
	    self.drawConnector(techID, pattID);
      }	
	} ); 
    
    for (dotId in dots) {
      var drawDot = dots[dotId];
	  self.drawDotAndLabel(drawDot);
	}

    
  };

  /* 
   * Layout function for a dot
   */
  self.layoutDot = function(i, cols, xOffset, yOffset, dot) {
    var column = i % cols;
    var row = Math.floor(i / cols);
    dot.xPos = (column * self.dotOffset) + xOffset;
    dot.yPos = (row * self.dotOffset) + yOffset;
  };

  /* 
   * Draw function for a dot
   */
  self.drawDotAndLabel = function( dot) {
  
    var circ, label;
    
    // Create a circle
    circ = self.paper.circle(dot.xPos,dot.yPos,self.dotRadius);
    circ.attr({
      'stroke-width' : 0,
      'fill' :         dot.colour,
      'opacity' :      0.5    
    });    
    
    // Create a label
    label = self.paper.text(dot.xPos,dot.yPos, dot.label);
    label.attr({
      'fill' :        '#ffffff',
      'font-size' :   20,
      'font-family' : "'League Gothic','Futura-CondensedMedium', 'Arial Narrow', sans-serif"
    });
    
    // Define hover animation
    hoverFunc = function() {
      circ.animate({scale: 1.15, opacity: 1.0}, 1000, 'elastic');
      
      var dot = $(circ.node).data("dot");
      var paths = dot.assocs;
      $(paths).each( function(i, path) {
        path.animate({opacity: 1.0}, 200, 'linear');
      } );
      
    }
    
    // Define hide animation
    hideFunc = function() {
      circ.animate({scale: 1.0, opacity: 0.5}, 1000, 'elastic');
      
      var dot = $(circ.node).data("dot");
      var paths = dot.assocs;
      $(paths).each( function(i, path) {
        path.animate({opacity: 0}, 200, 'linear');
      } );

    }
    
    // Define click action
    clickFunc = function(event) {
        window.open( $(this).data('dot').uri, '_blank');
    };
    
    $(circ.node).hover(hoverFunc, hideFunc);
    $(circ.node).click(clickFunc);
    $(label.node).hover(hoverFunc, hideFunc);
    $(label.node).click(clickFunc);
    
    // Associate ID and dot object with circle
    $(circ.node).attr("id",dot.id);
    $(circ.node).data("dot",dot);
  };

  /*
   * Draw function for a connector
   */
  self.drawConnector = function(srcId, destId) {
  
    var source = dots[srcId];
    var dest = dots[destId];
             
    var path =  self.paper.path(
       "M" +source.xPos+ " " +source.yPos+
       " L "+dest.xPos+" "+dest.yPos);     
    
    // Send it to the back, hide it, but store for later use
    path.toBack();
    path.attr({
      'stroke-width' : 3,
      'stroke' :       '#999999',
      'opacity' :      0    
    });    
	
	source.assocs.push( path );
	dest.assocs.push( path );

  }

  // Auto-initialize, when object is created
  self.init();

}



var viz;

jQuery(function() {

  viz = new PatternViz('vizDiv', 800, 600, [
    {'name':'JEE',   'id':'jee', 'uri':'http://en.wikipedia.org/wiki/Java_EE'},
    {'name':'JSP',   'id':'11',  'uri':''},
    {'name':'JSF',   'id':'13',  'uri':''},
    {'name':'EJB',   'id':'14',  'uri':''},
    {'name':'JPA',   'id':'15',  'uri':''},
    {'name':'SOAP',   'id':'16', 'uri':''},
    {'name':'JMS',    'id':'17', 'uri':''},
    {'name':'WS',     'id':'ws', 'uri':''},
    {'name':'WSDL',   'id':'20', 'uri':''},
    {'name':'XML',    'id':'21', 'uri':''},
  ],
  [
    {'name':'Broker',             'id':'broker', 'uri':'http://en.wikipedia.org/wiki/Message_broker'},
    {'name':'Front\nController',  'id':'1',      'uri':''},
    {'name':'Page\nController',   'id':'2',      'uri':''},
    {'name':'Layers',             'id':'layers', 'uri':''},
    {'name':'MVC',                'id':'3',      'uri':''},
    {'name':'Lazy Load',          'id':'lazy',   'uri':''},
    {'name':'Observer',           'id':'5',      'uri':''},
    {'name':'Proxy',              'id':'proxy',  'uri':''}
  ],
  [ 
    {'jee':'broker'},
    {'jee':'layers'},
    {'jee':'lazy'},
    {'jee':'proxy'},
    {'ws':'broker'},
    {'ws':'layers'}
  ]);

});