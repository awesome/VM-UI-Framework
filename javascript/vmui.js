/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Dynamically loads VMUI scripts based on need
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var VMUI = new Class({
	Implements: [Events, Options],

	options: {
		assets: [
		         {name:'Accordion', source:'Navigation/Accordion.js', selectors:'.accordion'},
		         {name:'Button', source:'Widgets/Button.js', selectors:'.button[data-state], [class*=Button][data-state]'},
		         {name:'CheckboxReplace', source:'Form/Replace/Checkbox.js', selectors:'input[type=checkbox]'},
		         {name:'RadioReplace', source:'Form/Replace/Radio.js', selectors:'input[type=radio]'},
		         {name:'SelectReplace', source:'Form/Replace/Select.js', selectors:'select:not([multiple])'},
		         {name:'Dropdown', source:'Navigation/Dropdown.js', selectors:'.dropdown, .megaDropdown'},
		         {name:'Lighter', source:'Lighter/Lighter.js', selectors:'pre'},
		         {name:'Modal', source:'Layout/Modal.js', selectors:'.modalTrigger'},
		         {name:'Notice', source:'Layout/Notice.js', selectors:'div.notice, div[class*="Notice"]'},
		         {name:'Carousel', source:'Layout/Carousel.js', selectors:'.carousel, .carouselClean, .carouselVertical'},
		         {name:'Social', source:'Widgets/Social.js', selectors:'.socialShare'},
		         {name:'Tabs', source:'Navigation/Tabs.js', selectors:'.tabs, .tabsVertical, .pillTabs, .pillTabsVertical'},
		         {name:'Tips', source:'Widgets/Tips.js', selectors:'[class*=tip], [class*=powertip]'},
		         {
		        	 name:'Charts', 
		        	 source:'Data/Charts.js', 
		        	 selectors:'.lineChart, .inlineLineChart, .scatterChart, .areaChart, .inlineAreaChart, .barChart, .inlineBarChart, .columnChart, .inlineColumnChart, .pieChart, .inlinePieChart'
		         },
		         {name:'Pin', source:'Layout/Pin.js', selectors:'.pin'},
		         {name:'Validate', source:'Form/Validate.js', selectors:'form'},
		         {name:'PasswordToggle', source:'Form/Password/Toggle.js', selectors:'input[type=password].toggle'},
		         {name:'PasswordMeter', source:'Form/Password/Meter.js', selectors:'input.meter'},
		         {name:'Sliders', source:'Form/Widget/Sliders.js', selectors:'input.slider'},
		         {name:'Autocomplete', source:'Form/Widget/Autocomplete.js', selectors:'input.autocomplete'},
		         {name:'Pager', source:'Layout/Pager.js', selectors:'.pager'},
		         {name:'MobileMenu', source:'Navigation/MobileMenu.js', selectors:'.mobileMenu'},
		         {name:'Reveal', source:'Widgets/Reveal.js', selectors:'.revealToggle'},
		         {name:'Baseline', source:'Layout/Baseline.js', selectors:'img, svg, canvas, object, video, audio, iframe, [class*=Chart]'} //This should always go last to let everything render
		],
		relativePath: '../JavaScript'		
	},

	/**
	 * @param object - options - The options object
	 */
	initialize: function(options){
		this.setOptions(options);
		var self = this;
		$(document.body).addEvent('ajaxUpdate', function(parent){self.loadScripts(parent);});
		var smoothScroll = new Fx.SmoothScroll({links: 'a:not(.revealToggle)'});
		this.loadScripts(document.body);		
	},	
	
	loadScripts: function(parent){
		var self = this;
		Array.each(this.options.assets, function(script){
			if (parent.getElements(script.selectors).length){
				if (self.checkExists(script.name)){
					Asset.javascript(self.options.relativePath+'/'+script.source, {
						 onLoad: function(){
							 if (script.name == 'Lighter'){
								self.loadLighter(parent.getElements(script.selectors));
							 } else {
								 var plugin = new window[script.name](parent.getElements(script.selectors));
							 }
						 }
					 });
				} else {
					 var plugin = new window[script.name](parent.getElements(script.selectors));
				}
			}
		});
	},

	checkExists: function(name){
		return (typeof name !== 'undefined');
	},

	loadLighter: function(selectors){
		var self = this;
		var assets = [
		     'Lighter/Loader.js', 'Lighter/Parser.js', 'Lighter/Parser/Smart.js',
		     'Lighter/Compiler.js', 'Lighter/Compiler/List.js', 'Lighter/Compiler/Inline.js', 'Lighter/Fuel.js',
		     'Lighter/Wick.js',
		];
		self.loadLighterAsset(assets, 0, selectors);
	},	
	
	/**
	 * This method forces the lighter assets to load sequentially, avoiding the occasional loading error
	 */
	loadLighterAsset: function(assets, index, selectors){
		var self = this;
		var last = assets.length;
		if (index != last){		
			if (self.checkExists(assets[index])){
				Asset.javascript(self.options.relativePath+'/'+assets[index], {
					onLoad: function(){
						index++;
						self.loadLighterAsset(assets, index, selectors);
					}
				});
			} else {
				index++;
				self.loadLighterAsset(assets, index, selectors);				
			}
		} else {
			this.igniteLighter(selectors);
		}
	},

	igniteLighter: function(selectors){
		var lighter = new Lighter({
			loader:   new Loader({}),
			parser:   new Parser.Smart({ strict: true }),
			compiler: new Compiler.List(),
			mode: 'ol'
		});

		$$(selectors).each(function(el) {
			lighter.light(el);
			
			//This fixes a bug in IE that creates duplicate codeblocks
			if (Browser.ie){
				var fixIEBug = function(){
					el.getNext().dispose();
				};
				fixIEBug.delay(500)
			}
		});	
	}
});