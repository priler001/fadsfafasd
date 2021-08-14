/**
 * Global variables
 */
'use strict';

var userAgent = navigator.userAgent.toLowerCase(),
	initialDate = new Date(),

	$document = $( document ),
	$window = $( window ),
	$html = $( 'html' ),

	isDesktop = $html.hasClass( 'desktop' ),
	isIE = userAgent.indexOf( 'msie' ) != -1 ? parseInt( userAgent.split( 'msie' )[ 1 ] ) : userAgent.indexOf( 'trident' ) != -1 ? 11 : userAgent.indexOf( 'edge' ) != -1 ? 12 : false,
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ),
	isTouch = 'ontouchstart' in window,
	onloadCaptchaCallback,
	isNoviBuilder,

	plugins = {
		bootstrapTabs:           $( '.tabs' ),
		materialParallax:        $( '.parallax-container' ),
		maps:                    $( '.google-map-container' ),
		rdInputLabel:            $( '.form-label' ),
		rdNavbar:                $( '.rd-navbar' ),
		regula:                  $( '[data-constraints]' ),
		radio:                   $( 'input[type=\'radio\']' ),
		checkbox:                $( '.checkbox-custom' ),
		toggles:                 $( '.toggle-custom' ),
		owl:                     $( '.owl-carousel' ),
		swiper:                  $( '.swiper-container' ),
		lightGallery:            $( '[data-lightgallery=\'group\']' ),
		lightGalleryItem:        $( '[data-lightgallery=\'item\']' ),
		lightDynamicGalleryItem: $( '[data-lightgallery=\'dynamic\']' ),
		progressBar:             document.querySelectorAll( '.progress-linear' ),
		isotope:                 $( '.isotope' ),
		customToggle:            $( '[data-custom-toggle]' ),
		selectFilter:            $( 'select' ),
		pageLoader:              $( '.page-loader' ),
		search:                  $( '.rd-search' ),
		searchResults:           $( '.rd-search-results' ),
		rdMailForm:              $( '.rd-mailform' ),
		iframeEmbed:             $( 'iframe.embed-responsive-item' ),
		bootstrapDateTimePicker: $( '[data-time-picker]' ),
		facebookplugin:          $( '#fb-root' ),
		captcha:                 $( '.recaptcha' ),
		videBG:                  $( '.bg-vide' )
	};


/**
 * @desc Check the element was been scrolled into the view
 * @param {object} elem - jQuery object
 * @return {boolean}
 */
function isScrolledIntoView ( elem, cb ) {
	if ( isNoviBuilder ) return true;

	var inView = elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();

	if ( !cb ) return inView;
	else if ( inView ) cb();
}

/**
 * @desc Calls a function when element has been scrolled into the view
 * @param {object} element - jQuery object
 * @param {function} func - init function
 */
function lazyInit ( element, func ) {
	var scrollHandler = function () {
		if ( ( !element.hasClass( 'lazy-loaded' ) && ( isScrolledIntoView( element ) ) ) ) {
			func.call();
			element.addClass( 'lazy-loaded' );
		}
	};

	scrollHandler();
	$window.on( 'scroll', scrollHandler );
}


/**
 * Initialize All Scripts
 */
$document.ready( function () {
	isNoviBuilder = window.xMode;

	/**
	 * @desc Calculate the height of swiper slider basing on data attr
	 * @param {object} object - slider jQuery object
	 * @param {string} attr - attribute name
	 * @return {number} slider height
	 */
	function getSwiperHeight ( object, attr ) {
		var val = object.attr( 'data-' + attr ),
			dim;

		if ( !val ) {
			return undefined;
		}

		dim = val.match( /(px)|(%)|(vh)|(vw)$/i );

		if ( dim.length ) {
			switch ( dim[ 0 ] ) {
				case 'px':
					return parseFloat( val );
				case 'vh':
					return $window.height() * (parseFloat( val ) / 100);
				case 'vw':
					return $window.width() * (parseFloat( val ) / 100);
				case '%':
					return object.width() * (parseFloat( val ) / 100);
			}
		} else {
			return undefined;
		}
	}

	/**
	 * @desc Toggle swiper videos on active slides
	 * @param {object} swiper - swiper slider
	 */
	function toggleSwiperInnerVideos ( swiper ) {
		var prevSlide = $( swiper.slides[ swiper.previousIndex ] ),
			nextSlide = $( swiper.slides[ swiper.activeIndex ] ),
			videos,
			videoItems = prevSlide.find( 'video' );

		for ( var i = 0; i < videoItems.length; i++ ) {
			videoItems[ i ].pause();
		}

		videos = nextSlide.find( 'video' );
		if ( videos.length ) {
			videos.get( 0 ).play();
		}
	}

	/**
	 * @desc Toggle swiper animations on active slides
	 * @param {object} swiper - swiper slider
	 */
	function toggleSwiperCaptionAnimation ( swiper ) {
		var prevSlide = $( swiper.container ).find( '[data-caption-animate]' ),
			nextSlide = $( swiper.slides[ swiper.activeIndex ] ).find( '[data-caption-animate]' ),
			delay,
			duration,
			nextSlideItem,
			prevSlideItem;

		for ( var i = 0; i < prevSlide.length; i++ ) {
			prevSlideItem = $( prevSlide[ i ] );

			prevSlideItem.removeClass( 'animated' )
			.removeClass( prevSlideItem.attr( 'data-caption-animate' ) )
			.addClass( 'not-animated' );
		}


		var tempFunction = function ( nextSlideItem, duration ) {
			return function () {
				nextSlideItem
				.removeClass( 'not-animated' )
				.addClass( nextSlideItem.attr( 'data-caption-animate' ) )
				.addClass( 'animated' );
				if ( duration ) {
					nextSlideItem.css( 'animation-duration', duration + 'ms' );
				}
			};
		};

		for ( var i = 0; i < nextSlide.length; i++ ) {
			nextSlideItem = $( nextSlide[ i ] );
			delay = nextSlideItem.attr( 'data-caption-delay' );
			duration = nextSlideItem.attr( 'data-caption-duration' );
			if ( !isNoviBuilder ) {
				if ( delay ) {
					setTimeout( tempFunction( nextSlideItem, duration ), parseInt( delay, 10 ) );
				} else {
					tempFunction( nextSlideItem, duration );
				}

			} else {
				nextSlideItem.removeClass( 'not-animated' );
			}
		}
	}

	/**
	 * Live Search
	 * @description  create live search results
	 */
	function liveSearch ( options ) {
		$( '#' + options.live ).removeClass( 'cleared' ).html();
		options.current++;
		options.spin.addClass( 'loading' );
		$.get( handler, {
			s:          decodeURI( options.term ),
			liveSearch: options.live,
			dataType:   'html',
			liveCount:  options.liveCount,
			filter:     options.filter,
			template:   options.template
		}, function ( data ) {
			options.processed++;
			var live = $( '#' + options.live );
			if ( options.processed == options.current && !live.hasClass( 'cleared' ) ) {
				live.find( '> #search-results' ).removeClass( 'active' );
				live.html( data );
				setTimeout( function () {
					live.find( '> #search-results' ).addClass( 'active' );
				}, 50 );
			}
			options.spin.parents( '.rd-search' ).find( '.input-group-addon' ).removeClass( 'loading' );
		} );
	}

	/**
	 * Google map function for getting latitude and longitude
	 */
	function getLatLngObject ( str, marker, map, callback ) {
		var coordinates = {};
		try {
			coordinates = JSON.parse( str );
			callback( new google.maps.LatLng(
				coordinates.lat,
				coordinates.lng
			), marker, map );
		} catch ( e ) {
			map.geocoder.geocode( { 'address': str }, function ( results, status ) {
				if ( status === google.maps.GeocoderStatus.OK ) {
					var latitude = results[ 0 ].geometry.location.lat();
					var longitude = results[ 0 ].geometry.location.lng();

					callback( new google.maps.LatLng(
						parseFloat( latitude ),
						parseFloat( longitude )
					), marker, map );
				}
			} );
		}
	}

	/**
	 * @desc Initialize Google maps
	 */
	function initMaps () {
		var key;

		for ( var i = 0; i < plugins.maps.length; i++ ) {
			if ( plugins.maps[ i ].hasAttribute( 'data-key' ) ) {
				key = plugins.maps[ i ].getAttribute( 'data-key' );
				break;
			}
		}

		$.getScript( '//maps.google.com/maps/api/js?' + ( key ? 'key=' + key + '&' : '' ) + 'sensor=false&libraries=geometry,places&v=quarterly', function () {
			var head = document.getElementsByTagName( 'head' )[ 0 ],
				insertBefore = head.insertBefore;

			head.insertBefore = function ( newElement, referenceElement ) {
				if ( newElement.href && newElement.href.indexOf( '//fonts.googleapis.com/css?family=Roboto' ) !== -1 || newElement.innerHTML.indexOf( 'gm-style' ) !== -1 ) {
					return;
				}
				insertBefore.call( head, newElement, referenceElement );
			};

			var geocoder = new google.maps.Geocoder;
			for ( var i = 0; i < plugins.maps.length; i++ ) {
				var zoom = parseInt( plugins.maps[ i ].getAttribute( 'data-zoom' ) ) || 11;
				var styles;
				if ( plugins.maps[ i ].hasAttribute( 'data-styles' ) ) {
					try {
						styles = JSON.parse( plugins.maps[ i ].getAttribute( 'data-styles' ) );
					}
					catch ( error ) {
						styles = [];
					}
				}
				var center = plugins.maps[ i ].getAttribute( 'data-center' );

				// Initialize map
				var map = new google.maps.Map( plugins.maps[ i ].querySelectorAll( '.google-map' )[ 0 ], {
					zoom:        zoom,
					styles:      styles,
					scrollwheel: false,
					center:      { lat: 0, lng: 0 }
				} );
				// Add map object to map node
				plugins.maps[ i ].map = map;
				plugins.maps[ i ].geocoder = geocoder;
				plugins.maps[ i ].keySupported = true;
				plugins.maps[ i ].google = google;

				// Get Center coordinates from attribute
				getLatLngObject( center, null, plugins.maps[ i ], function ( location, markerElement, mapElement ) {
					mapElement.map.setCenter( location );
				} );

				// Add markers from google-map-markers array
				var markerItems = plugins.maps[ i ].querySelectorAll( '.google-map-markers li' );
				if ( markerItems.length ) {
					var markers = [];
					for ( var j = 0; j < markerItems.length; j++ ) {
						var markerElement = markerItems[ j ];
						getLatLngObject( markerElement.getAttribute( 'data-location' ), markerElement, plugins.maps[ i ], function ( location, markerElement, mapElement ) {
							var icon = markerElement.getAttribute( 'data-icon' ) || mapElement.getAttribute( 'data-icon' );
							var activeIcon = markerElement.getAttribute( 'data-icon-active' ) || mapElement.getAttribute( 'data-icon-active' );
							var info = markerElement.getAttribute( 'data-description' ) || '';
							var infoWindow = new google.maps.InfoWindow( {
								content: info
							} );
							markerElement.infoWindow = infoWindow;
							var markerData = {
								position: location,
								map:      mapElement.map
							};
							if ( icon ) {
								markerData.icon = icon;
							}
							var marker = new google.maps.Marker( markerData );
							markerElement.gmarker = marker;
							markers.push( { markerElement: markerElement, infoWindow: infoWindow } );
							marker.isActive = false;
							// Handle infoWindow close click
							google.maps.event.addListener( infoWindow, 'closeclick', (function ( markerElement, mapElement ) {
								var markerIcon;
								markerElement.gmarker.isActive = false;
								if ( markerIcon = markerElement.getAttribute( 'data-icon' ) || mapElement.getAttribute( 'data-icon' ) ) {
									markerElement.gmarker.setIcon( markerIcon );
								}
							}).bind( this, markerElement, mapElement ) );


							// Set marker active on Click and open infoWindow
							google.maps.event.addListener( marker, 'click', (function ( markerElement, mapElement ) {
								if ( markerElement.infoWindow.getContent().length === 0 ) return;
								var gMarker, currentMarker = markerElement.gmarker, currentInfoWindow;
								for ( var k = 0; k < markers.length; k++ ) {
									var markerIcon;
									if ( markers[ k ].markerElement === markerElement ) {
										currentInfoWindow = markers[ k ].infoWindow;
									}
									gMarker = markers[ k ].markerElement.gmarker;
									if ( gMarker.isActive && markers[ k ].markerElement !== markerElement ) {
										gMarker.isActive = false;
										if ( markerIcon = markers[ k ].markerElement.getAttribute( 'data-icon' ) || mapElement.getAttribute( 'data-icon' ) ) {
											gMarker.setIcon( markerIcon );
										}
										markers[ k ].infoWindow.close();
									}
								}

								currentMarker.isActive = !currentMarker.isActive;
								if ( currentMarker.isActive ) {
									if ( markerIcon = markerElement.getAttribute( 'data-icon-active' ) || mapElement.getAttribute( 'data-icon-active' ) ) {
										currentMarker.setIcon( markerIcon );
									}

									currentInfoWindow.open( map, marker );
								} else {
									if ( markerIcon = markerElement.getAttribute( 'data-icon' ) || mapElement.getAttribute( 'data-icon' ) ) {
										currentMarker.setIcon( markerIcon );
									}
									currentInfoWindow.close();
								}
							}).bind( this, markerElement, mapElement ) );
						} );
					}
				}
			}
		} );
	}

	/**
	 * attachFormValidator
	 * @description  attach form validation to elements
	 */
	// function attachFormValidator ( elements ) {
	// 	// Custom validator - phone number
	// 	regula.custom({
	// 		name: 'Phone',
	// 		defaultMessage: 'Invalid phone number format',
	// 		validator: function() {
	// 			if ( this.value === '' ) return true;
	// 			else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test( this.value );
	// 		}
	// 	});

	// 	// Overriding default regula messages
	// 	var regulaLocalization = {
	// 		Required: 'Необходимо заполнить текстовое поле',
	// 		Email: 'Электронная почта задана некорректно',
	// 		Numeric: 'Допустимо использовать только цифры',
	// 		Selected: 'Пожалуйста, выберите вариант.',
	// 		Phone: 'Некорректный формат номера'
	// 	};

	// 	for ( var key in regulaLocalization ) regula.override({ constraintType: regula.Constraint[ key ], defaultMessage: regulaLocalization[ key ] });

	// 	for ( var i = 0; i < elements.length; i++ ) {
	// 		var o = $( elements[ i ] ), v;
	// 		o.addClass( 'form-control-has-validation' ).after( '<span class=\'form-validation\'></span>' );
	// 		v = o.parent().find( '.form-validation' );
	// 		if ( v.is( ':last-child' ) ) {
	// 			o.addClass( 'form-control-last-child' );
	// 		}
	// 	}

	// 	elements.on( 'input change propertychange blur', function ( e ) {
	// 		var $this = $( this ), results;

	// 		if ( e.type != 'blur' ) {
	// 			if ( !$this.parent().hasClass( 'has-error' ) ) {
	// 				return;
	// 			}
	// 		}

	// 		if ( $this.parents( '.rd-mailform' ).hasClass( 'success' ) ) {
	// 			return;
	// 		}

	// 		if ( (results = $this.regula( 'validate' )).length ) {
	// 			for ( i = 0; i < results.length; i++ ) {
	// 				$this.siblings( '.form-validation' ).text( results[ i ].message ).parent().addClass( 'has-error' );
	// 			}
	// 		} else {
	// 			$this.siblings( '.form-validation' ).text( '' ).parent().removeClass( 'has-error' );
	// 		}
	// 	} )
	// 	.regula( 'bind' );
	// }

	/**
	 * isValidated
	 * @description  check if all elemnts pass validation
	 */
	function isValidated ( elements, captcha ) {
		var results, errors = 0;

		if ( elements.length ) {
			for ( j = 0; j < elements.length; j++ ) {

				var $input = $( elements[ j ] );
				if ( (results = $input.regula( 'validate' )).length ) {
					for ( k = 0; k < results.length; k++ ) {
						errors++;
						$input.siblings( '.form-validation' ).text( results[ k ].message ).parent().addClass( 'has-error' );
					}
				} else {
					$input.siblings( '.form-validation' ).text( '' ).parent().removeClass( 'has-error' );
				}
			}

			if ( captcha ) {
				if ( captcha.length ) {
					return validateReCaptcha( captcha ) && errors == 0;
				}
			}

			return errors == 0;
		}
		return true;
	}

	/**
	 * validateReCaptcha
	 * @description  validate google reCaptcha
	 */
	function validateReCaptcha ( captcha ) {
		var $captchaToken = captcha.find( '.g-recaptcha-response' ).val();

		if ( $captchaToken == '' ) {
			captcha
			.siblings( '.form-validation' )
			.html( 'Please, prove that you are not robot.' )
			.addClass( 'active' );
			captcha
			.closest( '.form-group' )
			.addClass( 'has-error' );

			captcha.bind( 'propertychange', function () {
				var $this = $( this ),
					$captchaToken = $this.find( '.g-recaptcha-response' ).val();

				if ( $captchaToken != '' ) {
					$this
					.closest( '.form-group' )
					.removeClass( 'has-error' );
					$this
					.siblings( '.form-validation' )
					.removeClass( 'active' )
					.html( '' );
					$this.unbind( 'propertychange' );
				}
			} );

			return false;
		}

		return true;
	}

	/**
	 * onloadCaptchaCallback
	 * @description  init google reCaptcha
	 */
	onloadCaptchaCallback = function () {
		for ( i = 0; i < plugins.captcha.length; i++ ) {
			var $capthcaItem = $( plugins.captcha[ i ] );

			grecaptcha.render(
				$capthcaItem.attr( 'id' ),
				{
					sitekey:  $capthcaItem.attr( 'data-sitekey' ),
					size:     $capthcaItem.attr( 'data-size' ) ? $capthcaItem.attr( 'data-size' ) : 'normal',
					theme:    $capthcaItem.attr( 'data-theme' ) ? $capthcaItem.attr( 'data-theme' ) : 'light',
					callback: function ( e ) {
						$( '.recaptcha' ).trigger( 'propertychange' );
					}
				}
			);
			$capthcaItem.after( '<span class=\'form-validation\'></span>' );
		}
	};

	/**
	 * initOwlCarousel
	 * @description  Init owl carousel plugin
	 */
	function initOwlCarousel ( c ) {
		var aliaces = [ '-', '-xs-', '-sm-', '-md-', '-lg-', '-xl-' ],
			values = [ 0, 480, 768, 992, 1200, 1600 ],
			responsive = {},
			j, k;

		for ( j = 0; j < values.length; j++ ) {
			responsive[ values[ j ] ] = {};
			for ( k = j; k >= -1; k-- ) {
				if ( !responsive[ values[ j ] ][ 'items' ] && c.attr( 'data' + aliaces[ k ] + 'items' ) ) {
					responsive[ values[ j ] ][ 'items' ] = k < 0 ? 1 : parseInt( c.attr( 'data' + aliaces[ k ] + 'items' ), 10 );
				}
				if ( !responsive[ values[ j ] ][ 'stagePadding' ] && responsive[ values[ j ] ][ 'stagePadding' ] !== 0 && c.attr( 'data' + aliaces[ k ] + 'stage-padding' ) ) {
					responsive[ values[ j ] ][ 'stagePadding' ] = k < 0 ? 0 : parseInt( c.attr( 'data' + aliaces[ k ] + 'stage-padding' ), 10 );
				}
				if ( !responsive[ values[ j ] ][ 'margin' ] && responsive[ values[ j ] ][ 'margin' ] !== 0 && c.attr( 'data' + aliaces[ k ] + 'margin' ) ) {
					responsive[ values[ j ] ][ 'margin' ] = k < 0 ? 30 : parseInt( c.attr( 'data' + aliaces[ k ] + 'margin' ), 10 );
				}
			}
		}

		// Enable custom pagination
		if ( c.attr( 'data-dots-custom' ) ) {
			c.on( 'initialized.owl.carousel', function ( event ) {
				var carousel = $( event.currentTarget ),
					customPag = $( carousel.attr( 'data-dots-custom' ) ),
					active = 0;

				if ( carousel.attr( 'data-active' ) ) {
					active = parseInt( carousel.attr( 'data-active' ), 10 );
				}

				carousel.trigger( 'to.owl.carousel', [ active, 300, true ] );
				customPag.find( '[data-owl-item=\'' + active + '\']' ).addClass( 'active' );

				customPag.find( '[data-owl-item]' ).on( 'click', function ( e ) {
					e.preventDefault();
					carousel.trigger( 'to.owl.carousel', [ parseInt( this.getAttribute( 'data-owl-item' ), 10 ), 300, true ] );
				} );

				carousel.on( 'translate.owl.carousel', function ( event ) {
					customPag.find( '.active' ).removeClass( 'active' );
					customPag.find( '[data-owl-item=\'' + event.item.index + '\']' ).addClass( 'active' );
				} );
			} );
		}

		c.owlCarousel( {
			autoplay:      isNoviBuilder ? false : c.attr( 'data-autoplay' ) === 'true',
			loop:          isNoviBuilder ? false : c.attr( 'data-loop' ) !== 'false',
			items:         1,
			dotsContainer: c.attr( 'data-pagination-class' ) || false,
			navContainer:  c.attr( 'data-navigation-class' ) || false,
			mouseDrag:     isNoviBuilder ? false : c.attr( 'data-mouse-drag' ) !== 'false',
			nav:           c.attr( 'data-nav' ) === 'true',
			dots:          ( isNoviBuilder && c.attr( 'data-nav' ) !== 'true' ) ? true : c.attr( 'data-dots' ) === 'true',
			dotsEach:      c.attr( 'data-dots-each' ) ? parseInt( c.attr( 'data-dots-each' ), 10 ) : false,
			animateIn:     c.attr( 'data-animation-in' ) ? c.attr( 'data-animation-in' ) : false,
			animateOut:    c.attr( 'data-animation-out' ) ? c.attr( 'data-animation-out' ) : false,
			responsive:    responsive,
			navText:       $.parseJSON( c.attr( 'data-nav-text' ) ) || [],
			navClass:      $.parseJSON( c.attr( 'data-nav-class' ) ) || [ 'owl-prev', 'owl-next' ]
		} );
	}

	/**
	 * lightGallery
	 * @description Enables lightGallery plugin
	 */
	function initLightGallery ( itemsToInit, addClass ) {
		if ( !isNoviBuilder ) {
			$( itemsToInit ).lightGallery( {
				thumbnail: $( itemsToInit ).attr( 'data-lg-thumbnail' ) !== 'false',
				selector:  '[data-lightgallery=\'item\']',
				autoplay:  $( itemsToInit ).attr( 'data-lg-autoplay' ) === 'true',
				pause:     parseInt( $( itemsToInit ).attr( 'data-lg-autoplay-delay' ) ) || 5000,
				addClass:  addClass,
				mode:      $( itemsToInit ).attr( 'data-lg-animation' ) || 'lg-slide',
				loop:      $( itemsToInit ).attr( 'data-lg-loop' ) !== 'false'
			} );
		}
	}

	function initDynamicLightGallery ( itemsToInit, addClass ) {
		if ( !isNoviBuilder ) {
			$( itemsToInit ).on( 'click', function () {
				$( itemsToInit ).lightGallery( {
					thumbnail: $( itemsToInit ).attr( 'data-lg-thumbnail' ) !== 'false',
					selector:  '[data-lightgallery=\'item\']',
					autoplay:  $( itemsToInit ).attr( 'data-lg-autoplay' ) === 'true',
					pause:     parseInt( $( itemsToInit ).attr( 'data-lg-autoplay-delay' ) ) || 5000,
					addClass:  addClass,
					mode:      $( itemsToInit ).attr( 'data-lg-animation' ) || 'lg-slide',
					loop:      $( itemsToInit ).attr( 'data-lg-loop' ) !== 'false',
					dynamic:   true,
					dynamicEl:
										 JSON.parse( $( itemsToInit ).attr( 'data-lg-dynamic-elements' ) ) || []
				} );
			} );
		}
	}

	function initLightGalleryItem ( itemToInit, addClass ) {
		if ( !isNoviBuilder ) {
			$( itemToInit ).lightGallery( {
				selector:            'this',
				addClass:            addClass,
				counter:             false,
				youtubePlayerParams: {
					modestbranding: 1,
					showinfo:       0,
					rel:            0,
					controls:       0
				},
				vimeoPlayerParams:   {
					byline:   0,
					portrait: 0
				}
			} );
		}
	}

	/**
	 * IE Polyfills
	 * @description  Adds some loosing functionality to IE browsers
	 */
	if ( isIE ) {
		if ( isIE < 10 ) $html.addClass( 'lt-ie-10' );
		if ( isIE < 11 ) $html.addClass( 'ie-10' );
		if ( isIE === 11 ) $html.addClass( 'ie-11' );
		if ( isIE === 12 ) $html.addClass( 'ie-edge' );
	}

	// Swiper
	if ( plugins.swiper.length ) {
		for ( var i = 0; i < plugins.swiper.length; i++ ) {
			var s = $( plugins.swiper[ i ] );
			var pag = s.find( '.swiper-pagination' ),
				next = s.find( '.swiper-button-next' ),
				prev = s.find( '.swiper-button-prev' ),
				bar = s.find( '.swiper-scrollbar' ),
				swiperSlide = s.find( '.swiper-slide' ),
				autoplay = false;

			for ( var j = 0; j < swiperSlide.length; j++ ) {
				var $this = $( swiperSlide[ j ] ),
					url;

				if ( url = $this.attr( 'data-slide-bg' ) ) {
					$this.css( {
						'background-image': 'url(' + url + ')',
						'background-size':  'cover'
					} );
				}
			}

			swiperSlide.end()
			.find( '[data-caption-animate]' )
			.addClass( 'not-animated' )
			.end();

			s.swiper( {
				autoplay:                 !isNoviBuilder && $.isNumeric( s.attr( 'data-autoplay' ) ) ? s.attr( 'data-autoplay' ) : false,
				direction:                s.attr( 'data-direction' ) ? s.attr( 'data-direction' ) : 'horizontal',
				effect:                   s.attr( 'data-slide-effect' ) ? s.attr( 'data-slide-effect' ) : 'slide',
				speed:                    s.attr( 'data-slide-speed' ) ? s.attr( 'data-slide-speed' ) : 600,
				keyboardControl:          s.attr( 'data-keyboard' ) === 'true',
				mousewheelControl:        s.attr( 'data-mousewheel' ) === 'true',
				mousewheelReleaseOnEdges: s.attr( 'data-mousewheel-release' ) === 'true',
				nextButton:               next.length ? next.get( 0 ) : null,
				prevButton:               prev.length ? prev.get( 0 ) : null,
				pagination:               pag.length ? pag.get( 0 ) : null,
				paginationClickable:      pag.length ? pag.attr( 'data-clickable' ) !== 'false' : false,
				paginationBulletRender:   pag.length ? pag.attr( 'data-index-bullet' ) === 'true' ? function ( swiper, index, className ) {
					return '<span class="' + className + '">' + (index + 1) + '</span>';
				} : null : null,
				scrollbar:                bar.length ? bar.get( 0 ) : null,
				scrollbarDraggable:       bar.length ? bar.attr( 'data-draggable' ) !== 'false' : true,
				scrollbarHide:            bar.length ? bar.attr( 'data-draggable' ) === 'false' : false,
				loop:                     isNoviBuilder ? false : s.attr( 'data-loop' ) !== 'false',
				simulateTouch:            s.attr( 'data-simulate-touch' ) && !isNoviBuilder ? s.attr( 'data-simulate-touch' ) === 'true' : false,
				onTransitionStart:        function ( swiper ) {
					toggleSwiperInnerVideos( swiper );
				},
				onTransitionEnd:          function ( swiper ) {
					toggleSwiperCaptionAnimation( swiper );
				},
				onInit:                   function ( swiper ) {
					toggleSwiperInnerVideos( swiper );
					toggleSwiperCaptionAnimation( swiper );
					initLightGalleryItem( s.find( '[data-lightgallery="item"]' ), 'lightGallery-in-carousel' );
				}
			} );

			$window.on( 'resize', (function ( s ) {
				return function () {
					var mh = getSwiperHeight( s, 'min-height' ),
						h = getSwiperHeight( s, 'height' );
					if ( h ) {
						s.css( 'height', mh ? mh > h ? mh : h : h );
					}
				};
			})( s ) ).trigger( 'resize' );
		}
	}

	/**
	 * Copyright Year
	 * @description  Evaluates correct copyright year
	 */
	var o = $( '.copyright-year' );
	if ( o.length ) {
		o.text( initialDate.getFullYear() );
	}

	/**
	 * Progress bar
	 */
	if ( plugins.progressBar ) {
		for ( var i = 0; i < plugins.progressBar.length; i++ ) {
			var
				node = plugins.progressBar[i],
				progress = aProgress({
					node: node,
					counter: node.querySelector( '.progress-value' ),
					bar: node.querySelector( '.progress-bar-linear' )
				});

			progress.load();
			progress.reset();
			progress.bindScroll();
		}
	}

	/**
	 * Bootstrap tabs
	 * @description Activate Bootstrap Tabs
	 */
	if ( plugins.bootstrapTabs.length ) {
		var i;
		for ( i = 0; i < plugins.bootstrapTabs.length; i++ ) {
			var bootstrapTab = $( plugins.bootstrapTabs[ i ] );

			bootstrapTab.on( 'click', 'a', function ( event ) {
				event.preventDefault();
				$( this ).tab( 'show' );
			} );
		}
	}

	/**
	 * RD Input Label
	 * @description Enables RD Input Label Plugin
	 */
	if ( plugins.rdInputLabel.length ) {
		plugins.rdInputLabel.RDInputLabel();
	}

	/**
	 * Radio
	 * @description Add custom styling options for input[type="radio"]
	 */
	if ( plugins.radio.length ) {
		var i;
		for ( i = 0; i < plugins.radio.length; i++ ) {
			var $this = $( plugins.radio[ i ] );
			$this.addClass( 'radio-custom' ).after( '<span class=\'radio-custom-dummy\'></span>' );
		}
	}

	/**
	 * Checkbox
	 * @description Add custom styling options for input[type="checkbox"]
	 */
	if ( plugins.checkbox.length ) {
		var i;
		for ( i = 0; i < plugins.checkbox.length; i++ ) {
			var $this = $( plugins.checkbox[ i ] );
			$this.after( '<span class=\'checkbox-custom-dummy\'></span>' );
		}
	}

	/**
	 * Toggles
	 * @description Make toggles from input[type="checkbox"]
	 */
	if ( plugins.toggles.length ) {
		var i;
		for ( i = 0; i < plugins.toggles.length; i++ ) {
			var $this = $( plugins.toggles[ i ] );
			$this.after( '<span class=\'toggle-custom-dummy\'></span>' );
		}
	}

	/**
	 * Regula
	 * @description Enables Regula plugin
	 */
	if ( plugins.regula.length ) {
		attachFormValidator( plugins.regula );
	}

	/**
	 * WOW
	 * @description Enables Wow animation plugin
	 */
	if ( $html.hasClass( 'desktop' ) && $html.hasClass( 'wow-animation' ) && $( '.wow' ).length ) {
		new WOW().init();
	}

	/**
	 * Owl carousel
	 * @description Enables Owl carousel plugin
	 */
	if ( plugins.owl.length ) {
		for ( var i = 0; i < plugins.owl.length; i++ ) {
			var c = $( plugins.owl[ i ] );
			plugins.owl[ i ] = c;

			//skip owl in bootstrap tabs
			if ( !c.parents( '.tab-content' ).length ) {
				initOwlCarousel( c );
			}
		}
	}

	/**
	 * Isotope
	 * @description Enables Isotope plugin
	 */
	if ( plugins.isotope.length ) {
		var i, j, isogroup = [];
		for ( i = 0; i < plugins.isotope.length; i++ ) {
			var isotopeItem = plugins.isotope[ i ],
				filterItems = $( isotopeItem ).closest( '.isotope-wrap' ).find( '[data-isotope-filter]' ),
				iso = new Isotope( isotopeItem,
					{
						itemSelector: '.isotope-item',
						layoutMode:   isotopeItem.getAttribute( 'data-isotope-layout' ) ? isotopeItem.getAttribute( 'data-isotope-layout' ) : 'masonry',
						filter:       '*'
					}
				);

			isogroup.push( iso );

			filterItems.on( 'click', function ( e ) {
				e.preventDefault();
				var filter = $( this ),
					iso = $( '.isotope[data-isotope-group="' + this.getAttribute( 'data-isotope-group' ) + '"]' ),
					filtersContainer = filter.closest( '.isotope-filters' );

				filtersContainer
				.find( '.active' )
				.removeClass( 'active' );
				filter.addClass( 'active' );

				iso.isotope( {
					itemSelector: '.isotope-item',
					layoutMode:   iso.attr( 'data-isotope-layout' ) ? iso.attr( 'data-isotope-layout' ) : 'masonry',
					filter:       this.getAttribute( 'data-isotope-filter' ) == '*' ? '*' : '[data-filter*="' + this.getAttribute( 'data-isotope-filter' ) + '"]'
				} );

				$window.trigger( 'resize' );

				// If d3Charts contains in isotop, resize it on click.
				if ( filtersContainer.hasClass( 'isotope-has-d3-graphs' ) && c3ChartsArray != undefined ) {
					setTimeout( function () {
						for ( var j = 0; j < c3ChartsArray.length; j++ ) {
							c3ChartsArray[ j ].resize();
						}
					}, 500 );
				}

			} ).eq( 0 ).trigger( 'click' );
		}

		$( window ).on( 'load', function () {
			setTimeout( function () {
				var i;
				for ( i = 0; i < isogroup.length; i++ ) {
					isogroup[ i ].element.className += ' isotope--loaded';
					isogroup[ i ].layout();
				}
			}, 600 );
		} );
	}

	/**
	 * RD Navbar
	 * @description Enables RD Navbar plugin
	 */
	if ( plugins.rdNavbar.length ) {
		plugins.rdNavbar.RDNavbar( {
			stickUpClone:    (plugins.rdNavbar.attr( 'data-stick-up-clone' )) ? plugins.rdNavbar.attr( 'data-stick-up-clone' ) === 'true' : false,
			stickUpOffset:   (plugins.rdNavbar.attr( 'data-stick-up-offset' )) ? plugins.rdNavbar.attr( 'data-stick-up-offset' ) : 1,
			stickUp:         (!isNoviBuilder) ? plugins.rdNavbar.attr( 'data-stick-up' ) === 'true' : false,
			focusOnHover:    !isNoviBuilder ? true : false,
			anchorNavOffset: -78
		} );
		if ( plugins.rdNavbar.attr( 'data-body-class' ) ) {
			document.body.className += ' ' + plugins.rdNavbar.attr( 'data-body-class' );
		}
	}

	/**
	 * lightGallery
	 * @description Enables lightGallery plugin
	 */
	if ( plugins.lightGallery.length ) {
		for ( var i = 0; i < plugins.lightGallery.length; i++ ) {
			initLightGallery( plugins.lightGallery[ i ] );
		}
	}

	if ( plugins.lightGalleryItem.length ) {
		for ( var i = 0; i < plugins.lightGalleryItem.length; i++ ) {
			initLightGalleryItem( plugins.lightGalleryItem[ i ] );
		}
	}

	if ( plugins.lightDynamicGalleryItem.length ) {
		for ( var i = 0; i < plugins.lightDynamicGalleryItem.length; i++ ) {
			initDynamicLightGallery( plugins.lightDynamicGalleryItem[ i ] );
		}
	}

	/**
	 * Select2
	 * @description Enables select2 plugin
	 */
	if ( plugins.selectFilter.length ) {
		var i;
		for ( i = 0; i < plugins.selectFilter.length; i++ ) {
			var select = $( plugins.selectFilter[ i ] );

			select.select2( {
				theme: 'bootstrap'
			} ).next().addClass( select.attr( 'class' ).match( /(input-sm)|(input-lg)|($)/i ).toString().replace( new RegExp( ',', 'g' ), ' ' ) );
		}
	}

	/**
	 * Page loader
	 * @description Enables Page loader
	 */
	if ( plugins.pageLoader.length > 0 ) {

		$window.on( 'load', function () {
			var loader = setTimeout( function () {
				plugins.pageLoader.addClass( 'loaded' );
				$window.trigger( 'resize' );
			}, 200 );
		} );

	}

	/**
	 * RD Search
	 * @description Enables search
	 */
	if ( plugins.search.length || plugins.searchResults ) {
		var handler = 'bat/rd-search.php';
		var defaultTemplate = '<h5 class="search_title"><a target="_top" href="#{href}" class="search_link">#{title}</a></h5>' +
			'<p>...#{token}...</p>' +
			'<p class="match"><em>Terms matched: #{count} - URL: #{href}</em></p>';
		var defaultFilter = '*.html';

		if ( plugins.search.length ) {

			for ( i = 0; i < plugins.search.length; i++ ) {
				var searchItem = $( plugins.search[ i ] ),
					options = {
						element:                         searchItem,
						filter:                          (searchItem.attr( 'data-search-filter' )) ? searchItem.attr( 'data-search-filter' ) : defaultFilter,
						template:                        (searchItem.attr( 'data-search-template' )) ? searchItem.attr( 'data-search-template' ) : defaultTemplate,
						live:                            (searchItem.attr( 'data-search-live' )) ? searchItem.attr( 'data-search-live' ) : false,
						liveCount:                       (searchItem.attr( 'data-search-live-count' )) ? parseInt( searchItem.attr( 'data-search-live' ) ) : 4,
						current: 0, processed: 0, timer: {}
					};

				if ( $( '.rd-navbar-search-toggle' ).length ) {
					var toggle = $( '.rd-navbar-search-toggle' );
					toggle.on( 'click', function () {
						if ( !($( this ).hasClass( 'active' )) ) {
							searchItem.find( 'input' ).val( '' ).trigger( 'propertychange' );
						}
					} );
				}

				if ( options.live ) {
					searchItem.find( 'input' ).on( 'keyup input propertychange', $.proxy( function () {
						this.term = this.element.find( 'input' ).val().trim();
						this.spin = this.element.find( '.input-group-addon' );
						clearTimeout( this.timer );

						if ( this.term.length > 2 ) {
							this.timer = setTimeout( liveSearch( this ), 200 );
						} else if ( this.term.length == 0 ) {
							$( '#' + this.live ).addClass( 'cleared' ).html( '' );
						}
					}, options, this ) );
				}

				searchItem.submit( $.proxy( function () {
					$( '<input />' ).attr( 'type', 'hidden' )
					.attr( 'name', 'filter' )
					.attr( 'value', this.filter )
					.appendTo( this.element );
					return true;
				}, options, this ) );
			}
		}

		if ( plugins.searchResults.length ) {
			var regExp = /\?.*s=([^&]+)\&filter=([^&]+)/g;
			var match = regExp.exec( location.search );

			if ( match != null ) {
				$.get( handler, {
					s:        decodeURI( match[ 1 ] ),
					dataType: 'html',
					filter:   match[ 2 ],
					template: defaultTemplate,
					live:     ''
				}, function ( data ) {
					plugins.searchResults.html( data );
				} );
			}
		}
	}

	/**
	 * UI To Top
	 * @description Enables ToTop Button
	 */
	if ( isDesktop && !isNoviBuilder ) {
		$().UItoTop( {
			easingType:     'easeOutQuart',
			containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
		} );
	}

	/**
	 * Google ReCaptcha
	 * @description Enables Google ReCaptcha
	 */
	if ( plugins.captcha.length ) {
		var i;
		$.getScript( '//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en' );
	}

	/**
	 * RD Mailform
	 * @version      3.2.0
	 */
	if ( plugins.rdMailForm.length ) {
		var i, j, k,
			msg = {
				'MF000': 'Successfully sent!',
				'MF001': 'Recipients are not set!',
				'MF002': 'Form will not work locally!',
				'MF003': 'Please, define email field in your form!',
				'MF004': 'Please, define type of your form!',
				'MF254': 'Something went wrong with PHPMailer!',
				'MF255': 'Aw, snap! Something went wrong.'
			};

		for ( i = 0; i < plugins.rdMailForm.length; i++ ) {
			var $form = $( plugins.rdMailForm[ i ] ),
				formHasCaptcha = false;

			$form.attr( 'novalidate', 'novalidate' ).ajaxForm( {
				data:         {
					'form-type': $form.attr( 'data-form-type' ) || 'contact',
					'counter':   i
				},
				beforeSubmit: function ( arr, $form, options ) {
					if ( isNoviBuilder ) {
						return;
					}

					var form = $( plugins.rdMailForm[ this.extraData.counter ] ),
						inputs = form.find( '[data-constraints]' ),
						output = $( '#' + form.attr( 'data-form-output' ) ),
						captcha = form.find( '.recaptcha' ),
						captchaFlag = true;

					output.removeClass( 'active error success' );

					if ( isValidated( inputs, captcha ) ) {

						// veify reCaptcha
						if ( captcha.length ) {
							var captchaToken = captcha.find( '.g-recaptcha-response' ).val(),
								captchaMsg = {
									'CPT001': 'Пожалуйста, задайте "Ключ" и "Секретный ключ" для reCaptcha',
									'CPT002': 'Проблема в работе google reCaptcha'
								};

							formHasCaptcha = true;

							$.ajax( {
								method: 'POST',
								url:    'bat/reCaptcha.php',
								data:   { 'g-recaptcha-response': captchaToken },
								async:  false
							} )
							.done( function ( responceCode ) {
								if ( responceCode !== 'CPT000' ) {
									if ( output.hasClass( 'snackbars' ) ) {
										output.html( '<p><span class="icon text-middle fa fa-check icon-xxs"></span><span>' + captchaMsg[ responceCode ] + '</span></p>' );

										setTimeout( function () {
											output.removeClass( 'active' );
										}, 3500 );

										captchaFlag = false;
									} else {
										output.html( captchaMsg[ responceCode ] );
									}

									output.addClass( 'active' );
								}
							} );
						}

						if ( !captchaFlag ) {
							return false;
						}

						form.addClass( 'form-in-process' );

						if ( output.hasClass( 'snackbars' ) ) {
							output.html( '<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>' );
							output.addClass( 'active' );
						}
					} else {
						return false;
					}
				},
				error:        function ( result ) {
					if ( isNoviBuilder ) {
						return;
					}

					var output = $( '#' + $( plugins.rdMailForm[ this.extraData.counter ] ).attr( 'data-form-output' ) ),
						form = $( plugins.rdMailForm[ this.extraData.counter ] );

					output.text( msg[ result ] );
					form.removeClass( 'form-in-process' );

					if ( formHasCaptcha ) {
						grecaptcha.reset();
					}
				},
				success:      function ( result ) {
					if ( isNoviBuilder ) {
						return;
					}

					var form = $( plugins.rdMailForm[ this.extraData.counter ] ),
						output = $( '#' + form.attr( 'data-form-output' ) ),
						select = form.find( 'select' );

					form
					.addClass( 'success' )
					.removeClass( 'form-in-process' );

					if ( formHasCaptcha ) {
						grecaptcha.reset();
					}

					result = result.length === 5 ? result : 'MF255';
					output.text( msg[ result ] );

					if ( result === 'MF000' ) {
						if ( output.hasClass( 'snackbars' ) ) {
							output.html( '<p><span class="icon text-middle fa fa-check icon-xxs"></span><span>' + msg[ result ] + '</span></p>' );
						} else {
							output.addClass( 'active success' );
						}
					} else {
						if ( output.hasClass( 'snackbars' ) ) {
							output.html( ' <p class="snackbars-left"><span class="icon icon-xxs fa fa-exclamation-triangle text-middle"></span><span>' + msg[ result ] + '</span></p>' );
						} else {
							output.addClass( 'active error' );
						}
					}

					form.clearForm();

					if ( select.length ) {
						select.select2( 'val', '' );
					}

					form.find( 'input, textarea' ).trigger( 'blur' );

					setTimeout( function () {
						output.removeClass( 'active error success' );
						form.removeClass( 'success' );
					}, 3500 );
				}
			} );
		}
	}

	/**
	 * Custom Toggles
	 */
	if ( plugins.customToggle.length ) {
		var i;
		for ( i = 0; i < plugins.customToggle.length; i++ ) {
			var $this = $( plugins.customToggle[ i ] );
			$this.on( 'click', function ( e ) {
				e.preventDefault();
				$( '#' + $( this ).attr( 'data-custom-toggle' ) ).add( this ).toggleClass( 'active' );
			} );

			if ( $this.attr( 'data-custom-toggle-disable-on-blur' ) === 'true' ) {
				$( 'body' ).on( 'click', $this, function ( e ) {
					if ( e.target !== e.data[ 0 ] && $( '#' + e.data.attr( 'data-custom-toggle' ) ).find( $( e.target ) ).length == 0 && e.data.find( $( e.target ) ).length == 0 ) {
						$( '#' + e.data.attr( 'data-custom-toggle' ) ).add( e.data[ 0 ] ).removeClass( 'active' );
					}
				} );
			}
		}
	}

	/**
	 * Bootstrap Date time picker
	 */
	if ( plugins.bootstrapDateTimePicker.length ) {
		var i;
		for ( i = 0; i < plugins.bootstrapDateTimePicker.length; i++ ) {
			var $dateTimePicker = $( plugins.bootstrapDateTimePicker[ i ] );
			var options = {};

			options[ 'format' ] = 'dddd DD MMMM YYYY - HH:mm';
			if ( $dateTimePicker.attr( 'data-time-picker' ) == 'date' ) {
				options[ 'format' ] = 'dddd DD MMMM YYYY';
				options[ 'minDate' ] = new Date();
			} else if ( $dateTimePicker.attr( 'data-time-picker' ) == 'time' ) {
				options[ 'format' ] = 'HH:mm';
			}

			options[ 'time' ] = ($dateTimePicker.attr( 'data-time-picker' ) != 'date');
			options[ 'date' ] = ($dateTimePicker.attr( 'data-time-picker' ) != 'time');
			options[ 'shortTime' ] = true;

			$dateTimePicker.bootstrapMaterialDatePicker( options );
		}
	}

	/**
	 * Material Parallax
	 * @description Enables Material Parallax plugin
	 */
	if ( plugins.materialParallax.length ) {
		var i;

		if ( !isNoviBuilder && !isIE && !isMobile ) {
			plugins.materialParallax.parallax();
		} else {
			for ( i = 0; i < plugins.materialParallax.length; i++ ) {
				var parallax = $( plugins.materialParallax[ i ] ),
					imgPath = parallax.data( 'parallax-img' );

				parallax.css( {
					'background-image':      'url(' + imgPath + ')',
					'background-attachment': 'fixed',
					'background-size':       'cover'
				} );
			}
		}
	}

	/**
	 *  Enable Faceboock iframe
	 */
	if ( plugins.facebookplugin.length ) {
		for ( i = 0; i < plugins.facebookplugin.length; i++ ) {

			(function ( d, s, id ) {
				var js, fjs = d.getElementsByTagName( s )[ 0 ];
				if ( d.getElementById( id ) ) return;
				js = d.createElement( s );
				js.id = id;
				js.src = '//connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.5';
				fjs.parentNode.insertBefore( js, fjs );
			}( document, 'script', 'facebook-jssdk' ));
		}
	}

	/**
	 * Background Video
	 * @description  Enable Video plugin
	 */
	if ( plugins.videBG.length ) {
		for ( var i = 0; i < plugins.videBG.length; i++ ) {
			var $element = $( plugins.videBG[ i ] ),
				options = $element.data( 'vide-options' ),
				path = $element.data( 'vide-bg' );

			$element.vide( path, options );

			var videObj = $element.data( 'vide' ).getVideoObject();

			if ( isNoviBuilder ) {
				videObj.pause();
			} else {
				document.addEventListener( 'scroll', function ( $element, videObj ) {
					return function () {
						if ( isScrolledIntoView( $element ) ) {
							videObj.play();
						} else {
							videObj.pause();
						}
					};
				}( $element, videObj ) );
			}
		}
	}

	// Google maps
	if ( plugins.maps.length ) {
		lazyInit( plugins.maps, initMaps );
	}
} );