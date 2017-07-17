/**
	jKarma MVC javascript library
	
	Copyright 2011, Jacob Mouka
	Dual licensed under the MIT or GPL Version 2 licenses.
	

Version History:

0.12
-added removeFromArray

0.11
-display speed up and profiling
-changed render cloning: clone from a template
-added unique clone class name, so lists don't have to be in a parent node
-eventHandlers can be implicit (no need to pass in)
-dataBindings experimental
-a bit of refactoring for clarity

0.10
-added renderDropdown
-fixed IE bug with eventHandlers (function object does not have name)

0.9:
-added jKarma.HIDE constant

0.8:
-added recursive relationship rendering!
-made jKarma object with private methods

0.7:
-added eventHandlers parameter to jKarmaDisplay
-made passed-in node either a jQuery object or an id. 

0.6:
-added jKarmaClear, and included it in jKarmaDisplay

0.5
-does not overwrite values with '' if not in data

0.4
-form encoding will merge passed-on object
-form encoding encodes checkboxes to true/false

0.3
-added form encoding/decoding, particularly checkboxes and radiogroups
-added log utility function

TODO:
-add a version variable to the eventual object, and have it check for incompatibilities

*/


/**
Call with (node, data [, eventHandlers]):
	-node: is any of id, jQuery object, or html element
	-data: javascript object or array of objects
	-eventHanlders (optional): array of functions whose names match jKarma keys (ie class="$key"). 
	function will be called with parameters (associatedData, htmlElement). the function will be bound to the html element's onclick handler.
	
Instructions:
	-add html elements whose class name is $key, where key is the attribute or function (zero-parameter) of the object to be displayed
	-passed-in node should be a parent node for the html elements to fill out
	-if data is an array, node should be a wrapper node that can be cloned. It's a good idea for that wrapper
	to have another wrapper, to contain all the cloned nodes in 1 parent. eg: pass in listItem to jKarma: list > listItem > displayed values 
	

Different node types:
	-form input elements get their value set
	-img tags get their src set
	
Predefined classes:

Constants (return these values for the data bindings to do their associated action):
-jKarma.HIDE: the element will be hidden. NOTE: showing nodes that have been hidden overwrites their display property.
If they had a inline, non-default display setting (eg for <A style="display:block;">) it will be reset to default when 
showing them again. For those nodes use a style block, as opposed to inline style.
*/


(function( window, undefined ) {
	function jKarma() {
		/** Constant that, if bound to a node, it will be hidden upon a call to display(). */
		this.HIDE = "jKarmaHIDE";
		
		/** if true jKarma will manage the links between the data and the rendered elements */
		var bindingsEnabled = false;
		
		/** when the dom is updated (with a call to clear, or display) we should check for stale bindings */
		var updateBindings = false;
		
		/** the bindings between data and their rendered elements */
		var bindings = new Array();
		
		// dev variable
		var profiling = false;
		
		/** public (wrapper) method that is responsible for the rendering.*/
		this.display = function(node, data, eventHandlers) {
			updateBindings = true;
			var startDate, endDate;

			if(profiling) {
				startDate = new Date();
			}

			//NOTE this method should only do some preliminary setup and call the private doDisplay to do the actual work
			
			node = $(node);
			
			//change an array of functions into dictionary of functions
			if(eventHandlers && jQuery.isArray(eventHandlers)) {
				eventHandlers = buildFunctionDictionary(eventHandlers);
			}
			
			//The node may have been hidden in prev rendering or cloned from a hidden node. Only show 
			//previously-hidden nodes because it might mess up inline styles with 'display'.
			node.find('.' + this.HIDE).show().removeClass(this.HIDE);

			doDisplay(node, data, eventHandlers);
			
			if(profiling) {
				endDate = new Date();
				log('time (ms): ', endDate.getTime()-startDate.getTime());
			}
		}

		/** private method that implements rendering an object or an array. 
			@param node 			a jQuery object
			@param data 			the data to render (either an object or array)
			@param eventHandlers	dictionary of <function name><function>
			@param keyPrefix		optional string that is a prefix in the data-binding key (class name), used for traversing relationships.
		 */
		var doDisplay = function(node, data, eventHandlers, keyPrefix) {
			var cloneClass = node.attr('id') + '_CLONED';
			node.parent().find('.' + cloneClass).remove();
			node.find('._CLONED').remove();//do this to remove recursed nodes
			var isArray = jQuery.isArray(data);
			
			if(isArray && data.length>0) {
				var template = node.clone(); // IMPORTANT: clone it first, since rendering it may change (eg hide elements)
				template.removeAttr('id');
				template.addClass(cloneClass);
				renderNode(node, data[0], eventHandlers, keyPrefix);
				var newNode;
				var lastNodeAdded = node;
				for(var i=1; i<data.length; i++) {
					newNode = template.clone();
					renderNode(newNode, data[i], eventHandlers, keyPrefix);
					lastNodeAdded.after(newNode); //use this instead of parent.append(...) so that parent can have more complicated structure
					lastNodeAdded = newNode;
				}
			}
			else if(!isArray && data) {
				renderNode(node,data, eventHandlers, keyPrefix);
			}
			else {
				//if data is undefined or array length==0 clear the node
				window.jKarma.clear(node);
			}
		}
		
		/** this method does the actual rendering work
			@param node 			a jQuery object
			@param data 			the data to render (either an object or array)
			@param eventHandlers	dictionary of <function name><function>
			@param keyPrefix		optional string that is a prefix in the data-binding key (class name), used for traversing relationships.
		 */
		var renderNode = function(node, data, eventHandlers, keyPrefix) {
			var nodes = node.find("[class*='$']");
			var n;
			var key;

			/* NOTE: in some cases (all?)
				this == window
				jKarma == the class constructor
				window.jKarma == the correct object
			*/			
			
			for(var i=0; i<nodes.length; i++) {
				n = $(nodes[i]);
				key = parseKey(n.attr('class'), keyPrefix);
				if(!key) {
					continue;
				}
				
				if(eventHandlers && eventHandlers[key]) {
					n.unbind('click');
					n.bind('click', makeClosure(data, eventHandlers[key]));
				}
				else if(data[key]!==undefined) {
					//TODO remove this... eventHandlers is way better
					if(n.hasClass('click')) {
						n.unbind('click');
						n.bind('click', data[key]);
					}
					else {
						//get data's value (test if it's an function or an attribute)
						var newValue = (typeof data[key]=='function' ? data[key]() : data[key]);
						if(newValue===window.jKarma.HIDE) {
							n.hide();
							n.addClass(window.jKarma.HIDE);
						}
						else {
							if(jQuery.isArray(newValue)) {
								doDisplay(n, newValue, eventHandlers, (keyPrefix ? keyPrefix+key+'.' : key + '.'));
							}
							else {
								if(bindingsEnabled) {
									bindData(data, n, key);
								}
								if(n.is(':input')) {
									if(n.is('[type=checkbox]')) {
										n.attr('checked', data[key]=='on' || data[key]===true || data[key]=='true');
									}
									else if(n.is('[type=radio]')) {
										n.attr('checked', n.attr('value')==data[key]);
									}
									else {
										n.val(newValue);
									}
								}
								else if(n.is('img')) {
									n.attr('src', newValue);
								}
								else if(n.is('a')) {
									n.attr('href', newValue);
								}
								else {
									//set value for regular html element
									n.html(newValue);
								}
							}
						}
					}
				}
				else if(window[key] && typeof window[key]=='function') {
					//TODO test the global handler lookup in IE
					n.unbind('click');
					n.bind('click', makeClosure(data, window[key]));
				}
			} //end for
		};


		/**
		Takes a node class string (can be more than one class name) and returns the data binding key.
		If keyPrefix is passed in it will strip it from the key.
		*/
		var parseKey = function(s, keyPrefix) {
			var a = s.indexOf('$');
			var key = null;
			if(a>-1) {
				// first get everything between '$' and ' '
				var b = s.indexOf(' ', a);
				if(b>-1) {
					//parse out everything after the '$' and before the next ' '
					key = s.substr(a+1, b-a-1);
				}
				else {
					//if no spaces, just return the whole thing after the '$'
					key = s.substr(a+1);
				}
				
				//strip out the prefix
				if(keyPrefix) {
					if(key.indexOf(keyPrefix)!=0 || key.length<=keyPrefix.length) {
						key = null;
					}
					key = key.substr(keyPrefix.length);
				}
			}

			return key;
		};

		/** needed for IE compatibility */
		this.getNameOfFunction = function(o) {
			var funcNameRegex = /function (.{1,})\(/;
			var results = (funcNameRegex).exec(o.toString());
			return (results && results.length > 1) ? results[1] : "";
		};

		
		//pass in an array of functions, returns dictionary of { functionName: function }
		var buildFunctionDictionary = function (funcs) {
			var result = new Object();
			var f, name;
			for(var i=0; i<funcs.length; i++) {
				f = funcs[i];
				name = (f.name ? f.name : window.jKarma.getNameOfFunction(f));
				result[name] = funcs[i];
			}
			return result;
		};
		
		var makeClosure = function (object, func) {
			return function() {
				func(object, this);
			}
		};
		
		/** this will clear the node of data, returning it to it's pristine state. */
		this.clear = function (node) {
			updateBindings = true;
			node = $(node);
			
			node.parent().find('.' + node.attr('id') + '_CLONED').remove();

			var nodes = node.find("[class*='$']");
			var n;
			for(var i=0; i<nodes.length; i++) {
				n = $(nodes[i]);
				if(n.is(':input')) {
					if(n.is('[type=checkbox]')) {
						n.attr('checked', false);
					}
					else if(n.is('[type=radio]')) {
						n.attr('checked', false);
					}
					else {
						n.val('');
					}
				}
				else if(n.is('img')) {
					n.attr('src', '');
				}
				else if(n.is('a')) {
					n.unbind('click');
				}
				else {
					//set value for all other html element IFF their children is a text node 
					var children = n.contents();
					if(children.length==1 && children[0].nodeType==3) {
						n.html('');
					}
				}
			}
		}
		
		/**
		 * This encodes a form into a javascript object. If obj is passed in this effectively merges
		 * the form into the object. Note checkboxes are converted to true/false;
		 * @param form	a form node, id, or jQuery object
		 * @param obj	(optional) if passed in the form's data will be merged into this object.
		 * @returns obj
		 */
		this.encodeForm = function(form, obj) {
			form = $(form);
			var formData = form.serializeArray();
			if(!obj) {
				obj = new Object();
			}
			for(var i=0; i<formData.length; i++) {
				obj[formData[i].name] = formData[i].value;
			}
			
			//handle checkboxes so that values are [true,false]
			var checkboxes = form.find('[type=checkbox]');
			var checkbox;
			for(var i=0; i<checkboxes.length; i++) {
				checkbox = checkboxes[i];
				obj[checkbox.name] = $(checkbox).attr('checked');
			}
			return obj;
		};
		
		
		// ---- Data Bindings -----------------------------------------------------------
		/** turns data binding on or off */
		this.enableBindings = function(val) {
			bindingsEnabled = val;
		}
		/*
		
		data structure is wrong
		
		look for node, and if found update the bound data object (not key)
		*/

		/** method to bind the data to the node.
		 @param data	the data object
		 @param node	the jQuery node
		 @param key		data's attribute being bound
		 */
		var bindData = function(data, node, key) {
			//TODO figure out if we're pushing or just updating
			//bindings.push({data:data, node:node, key:key});
			
			var binding = null;
			for(var i=0; i<bindings.length; i++) {
				if(bindings[i].data === data) {
					binding = bindings[i];
					break;
				}
			}
			if(!binding) {
				binding = {data:data, nodes:new Array()};
				bindings.push(binding);
				binding.nodes.push({node:node, key:key});
			}
			else {
				var nodeFound = false;
				log('looking for', node[0]);
				for(var i=0; i<binding.nodes.length; i++) {
					log(binding.nodes[i].node[0]);
					if(binding.nodes[i].node[0]===node[0]) {
						log('yes');
						nodeFound=true;
						break;
					}
				}
				if(!nodeFound) {
					binding.nodes.push({node:node, key:key});
					log('adding binding node', node[0]);
				}
				else {
					log('not adding repeat node', node[0]);
				}
			}
			
		}
		
		/** This will update all html nodes bound to the data object with the object's new values. */
		this.update = function(data) {
			//remove stale bindings
			if(updateBindings) {
				updateBindings = false;
				var newBindings = new Array();
				for(var i=0; i<bindings.length; i++) {
					var binding = bindings[i];
					var newNodes = new Array();
					for(var j=0; j<binding.nodes.length; j++) {
						if(binding.nodes[j].parent()) {
							newNodes.push(binding.nodes[j]);
						}
						else {
							log('removing node', binding.nodes[j]);
						}
					}
					if(newNodes.length>0) {
						binding.nodes = newNodes;
						newBindings.push(binding);
					}
					else {
						log('removing binding', binding);
					}
				}
				bindings = newBindings;
			}
			//log('updating', data);
			
			
			/*
			for(var i=0; i<bindings.length; i++) {
				if(bindings[i].data===data) {
					var val = data[bindings[i].key];
					if(typeof val=='function') {
						val = data[bindings[i].key]();
					}
					bindings[i].node.html(val);
					//log('updating:', bindings[i].node[0]);
					//log('with val:', val);
					//TODO add the rest of the rendering types
				}
			}
			*/
			var binding = null;
			for(var i=0; i<bindings.length; i++) {
				if(bindings[i].data === data) {
					binding = bindings[i];
					break;
				}
			}
			if(binding) {
				for(var i=0; i<binding.nodes.length; i++) {
					var val = data[binding.nodes[i].key];
					if(typeof val=='function') {
						val = data[binding.nodes[i].key]();
					}
					binding.nodes[i].node.html(val);
					//log('updating:', bindings[i].node[0]);
					//log('with val:', val);
					//TODO add the rest of the rendering types
				}
			}
		}
		
		/**
		Searches for an object (or primitive value) in an array by comparing the objects' 'key' attributes.
		If value is an object this will get it's value by key also.
		@param value	an object or primitive value
		@param key		is a string.
		*/ 
		this.inArrayByKey = function(value, key, array) {
			value = (value instanceof Object ? value[key] : value);
			for(var i=0; i<array.length; i++) {
				if(value==array[i][key]) {
					return i;
				}
			}
			return -1;
		};
		
		this.removeFromArray = function(value, array) {
			var i = jQuery.inArray(value, array);
			if(i>-1) {
				array.splice(i, 1);
			}
		}
		
		/**
		Creates a dropdown (select) field.
		@param node		the parent select tag (id, html node, or jQuery object)
		@param values	can be simple array of value or objects
		@param key		(optional) if values are objects use this to get the attribute.
		*/
		this.renderDropdown = function(node, values, key) {
			node = $(node);
			for(var i=0; i<values.length; i++) {
				node.append("<option>" + (key? values[i][key] : values[i]) + "</option>");
			}	
		};

		
	}; // end of jKarma class

	// Expose jQuery to the global object
	window.jKarma = new jKarma();

})(window);

//utility method to assign a function by key to an array of objects. */
function jKarmaAddFunction(values, key, func) {
	for(var i=0; i<values.length; i++) {
		values[i][key] = func;
	}
};

//utility method to assign a closure (func gets called for each object in values) by key to an array of objects. */
function jKarmaAddClosure(values, key, func) {
	for(var i=0; i<values.length; i++) {
		values[i][key] = func(values[i]);
	}
};

function log(val1, val2) {
	if(window.console) {
		if(val2!==undefined)
			console.log(val1, val2);
		else
			console.log(val1);
	}
}

/** @deprecated wrapper function for transition.. use jKarma.display instead.*/
function jKarmaDisplay(node, data, eventHandlers) {
	jKarma.display(node, data, eventHandlers);
}
/** @deprecated wrapper function for transition.. use jKarma.encodeForm instead.*/
function jKarmaEncodeForm(form, obj) {
	return jKarma.encodeForm(form, obj);
}

/** centers a (jquery) node within its parent */
function center(node, dx, dy) {
	node.css({
		position:'absolute',
		top:'50%',
		left:'50%'
	})
	dx = dx || 0;
	dy = dy || 0;
	var w = -node.width()/2 + dx;
	var h = -node.height()/2 + dy;
	node.css({
		'margin-left':w+'px',
		'margin-top':h+'px'
	});
}
