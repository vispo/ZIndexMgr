// 7/19/19 ZIndexMgr 


function ZIndexMgr() {

	// See ZIndexMgr_doc.js for documentation
	// See bottom of this constructor for the initialization code.

	//*****************************************************************************************************
	// VARIABLES
	//*****************************************************************************************************

	var sortedWindowList=[]; 
	// sortedWindowList is an array of DOM elements sorted by zIndex from low to high. 
	// Each element is a window/container managed by its instance of ZIndexMgr.
	// There are never any elements in sortedWindowList simultaneously with the same zIndex value.
	var zIncrement=1048576; // This number is 2^20.
	// When the manager moves an element to the front or back, the new zIndex value of the moved
	// window is zIncrement units distant from the closest window's zIndex value.
	var zStartingValue=1073741824; // This is 2^30.
	// The first element to get added to the manager starts out with this value.
	var args=arguments;
	var that=this;

	//*****************************************************************************************************
	// PUBLIC METHODS
	//*****************************************************************************************************

	this.windowList=function() {
		// Returns a clone of the array of DOM elements of the containers that contain the
		// managed windows. The array is sorted by zIndex value from low to high.
		return sortedWindowList.slice(0);
	} // end windowList
	//-----------------------------------------------------------------------------------------------------

	this.add=function(element) {
		// This method registers a window/container for the ZIndexMgr to manage.
		// This sets the element/window to be on top. So when you add your
		// windows when the program starts (after loading), call the add method
		// first on the window you want to be at the bottom and then call the add
		// method in ascending z-Index order. The element must be either an HTML element
		// or the id of an HTML element. 
		sortedWindowList=this.sortByZIndex(sortedWindowList);
		if (typeof element == 'string') element=document.getElementById(element);
		if (typeof element == 'object') {
			if (element.id == "") console.log('Method add called with element whose id is the empty string. The id must be a unique string.');
			var isAlreadyIn = findObjInList(element, sortedWindowList);
			if (isAlreadyIn == -1) {
				// Then element is not already in sortedWindowList, so we proceed to add it.
				var style = window.getComputedStyle(element);
				var positionValue = style.position;
				//if (positionValue == 'static') element.style.position = 'absolute';

				if (positionValue == 'static') {
					console.log(element.id + ' has css position==static (according to getComputedStyle) but ZIndexMgr requires it be a positioned element')
				}
				if (sortedWindowList.length==0) {
					element.style.zIndex = zStartingValue;
					sortedWindowList.push(element);
				}
				else {
					var topZIndex = this.topZIndex();
					var newZIndex = topZIndex + zIncrement;
					element.style.zIndex = newZIndex;
					sortedWindowList.push(element);
				}
				
				return true;
			}
			else {
				return false;
			}
		}
		else {
			console.log('Method add of ZindexMgr called with bad parameter.');
			return false;
		}
	} // end add
	//-----------------------------------------------------------------------------------------------------

	this.sendToFront=function(element, element2) {
		// Sends element in front of element2 (and behind anything in front of element2).
		// If element2 is undefined, element is sent to the front of all windows.
		// element and element2 can be DOM elements or the id's of DOM elements.
		// Returns true if the operation was successfully carried out, false otherwise.
		sortedWindowList=this.sortByZIndex(sortedWindowList);
		if (typeof element == 'string') element=document.getElementById(element);
		if (typeof element != 'object') return false;
		if (typeof element2 == 'string') element2=document.getElementById(element2);
		var isIn = findObjInList(element, sortedWindowList);
		if (isIn != -1) {
			// element is an object and it is in sortedWindowList
			if (!element2) {
				// Then we simply send element to front of all windows/layers/containers.
				var elementZIndex=parseInt(element.style.zIndex);
				var highestZIndex = this.topZIndex();
				if (highestZIndex != elementZIndex) {
					var newHighest = highestZIndex + zIncrement;
				}
				else {
					var newHighest = elementZIndex;
				}
				element.style.zIndex=newHighest;
				this.delete(element);
				sortedWindowList.push(element);
				return true;
			}
			else {
				// element2 exists but is it an object?
				if (typeof element2 == 'object') {
					if (element.id == element2.id) {
						console.log('sendToFront called with two equal parameters (id=' + element.id + ')');
						return false;
					}
					var element2Index = findObjInList(element2, sortedWindowList);
					if (element2Index == -1) {
						console.log('sendToFront called with second parameter (id=' + element2.id + ') not added to ZIndexMgr');
						return false;
					}
					// Then we send element in front of element2 but behind any windows
					// in front of element2.
					var element2zIndex = parseFloat(window.getComputedStyle(element2).zIndex);
					if (element2Index == sortedWindowList.length-1) {
						// Then element2 is at the end of sortedWindowList
						this.delete(element);
						var newHighest = element2zIndex + zIncrement;
						element.style.zIndex = newHighest;
						sortedWindowList.push(element);
						return true;
					}
					else {
						// Then element2 is not at the end of sortedWindowList
						this.delete(element);
						var element2Index = findObjInList(element2, sortedWindowList);
						if (element2Index < sortedWindowList.length-1) {
							var higherWindowElement = sortedWindowList[element2Index+1];
							var higherWindowStyle = window.getComputedStyle(higherWindowElement);
							var higherWindowZIndex = parseFloat(higherWindowStyle.zIndex);
							var newElementZIndex = (element2zIndex + higherWindowZIndex)/2;
							if (Number.isInteger(newElementZIndex)) {
								element.style.zIndex = newElementZIndex;
								sortedWindowList.splice(element2Index+1,0,element);
							}
							else {
								// zIndex values must be integers, believe it or not. Dumb eh? Oh well.
								newElementZIndex=Math.round(newElementZIndex);
								element.style.zIndex = newElementZIndex;
								sortedWindowList.splice(element2Index+1,0,element);
								resetZIndexValues();
							}
						}
						else {
							// There are no windows in front of element2
							var newElementZIndex = element2zIndex + zIncrement;
							element.style.zIndex = newElementZIndex;
							sortedWindowList.push(element);
						}
						return true;
					}
				}
				else {
					return false;
				}
			}
		}
		else {
			console.log('sendToFront called with element (id=' + element.id + ') that has not been added to ZIndexMgr.');
			return false;
		}
	} // end sendToFront
	//-----------------------------------------------------------------------------------------------------

	this.sendToBack=function(element, element2) {
		// Sends element behind element2 (and in front of anything behind element2).
		// If element2 is undefined, element is sent to the back of all windows.
		// element and element2 can be DOM elements or the id's of DOM elements.
		// Returns true if the operation was successfully carried out, false otherwise.
		sortedWindowList=this.sortByZIndex(sortedWindowList);
		if (typeof element == 'string') element=document.getElementById(element);
		if (typeof element != 'object') return false;
		if (typeof element2 == 'string') element2=document.getElementById(element2);
		var isIn = findObjInList(element, sortedWindowList);
		if (isIn != -1) {
			// element is an object and it is in sortedWindowList
			if (!element2) {
				// Then we simply send element to back of all windows/layers/containers.
				this.delete(element);
				if (sortedWindowList.length > 0) {
					var lowestZIndex = window.getComputedStyle(sortedWindowList[0]).zIndex;
					var newLowestZIndex = lowestZIndex - zIncrement;
					element.style.zIndex = newLowestZIndex;
					sortedWindowList.splice(0,0,element);
					return true;
				}
				else {
					element.style.zIndex = zStartingValue;
					sortedWindowList.push(element);
					return true;
				}
			}
			else {
				// element2 exists but is it an object?
				if (typeof element2 == 'object') {
					if (element.id == element2.id) {
						console.log('sendToBack called with two equal parameters (id=' + element.id + ')');
						return false;
					}
					var element2Index = findObjInList(element2, sortedWindowList);
					if (element2Index == -1) {
						console.log('sendToBack called with second parameter (id=' + element2.id + ') not added to ZIndexMgr');
						return false;
					}
					// Then we send element behind element2 but in front of any windows
					// behind element2.
					var element2zIndex = parseFloat(window.getComputedStyle(element2).zIndex);
					this.delete(element);
					var element2Index = findObjInList(element2, sortedWindowList);
					if (element2Index == 0) {
						// Then element2 is at the beginning of sortedWindowList
						var newLowest = element2zIndex - zIncrement;
						element.style.zIndex = newLowest;
						sortedWindowList.splice(0,0,element);
					}
					else {
						// Then element2 is not at the beginning of sortedWindowList
						var lowerWindowElement = sortedWindowList[element2Index-1];
						var lowerWindowStyle = window.getComputedStyle(lowerWindowElement);
						var lowerWindowZIndex = parseFloat(lowerWindowStyle.zIndex);
						var newElementZIndex = (element2zIndex + lowerWindowZIndex)/2;
						if (Number.isInteger(newElementZIndex)) {
							element.style.zIndex = newElementZIndex;
							sortedWindowList.splice(element2Index,0,element);
						}
						else {
							// zIndex values must be integers! Dumb eh?
							newElementZIndex = Math.round(newElementZIndex);
							element.style.zIndex = newElementZIndex;
							sortedWindowList.splice(element2Index,0,element);
							resetZIndexValues();
						}
					}
					return true;
				}
				else {
					return false;
				}
			}
		}
		else {
			console.log('sendToBack called with element (id=' + element.id + ') that has not been added to ZIndexMgr.');
			return false;
		}
	} // end sendToBack
	//-----------------------------------------------------------------------------------------------------

	this.moveBy=function(element, offset) {
		// If offset is a positive integer, moveBy elevates element over that
		// many intervening windows. If offset is a negative integer, moveBy
		// lowers element below that many intervening windows. If offset is 
		// larger than the actual number of intervening windows, element is 
		// simply elevated to the top of all windows. Similarly, if offset 
		// is negative and is less than the number of windows below element,
		// then element is simply lowered to the bottom of all the windows.
		sortedWindowList=this.sortByZIndex(sortedWindowList);
		if (typeof element == 'string') element=document.getElementById(element);
		var isIn = findObjInList(element, sortedWindowList);
		if (isIn != -1) {
			// element is now a DOM obj and is in sortedWindowList
			var elementIndex = isIn;
			var offset=Math.round(offset); // make sure it's an integer
			// Now we make sure offset is in range.
			if (offset > 0) {
				var maxOffset = (sortedWindowList.length-1) - elementIndex;
				if (offset > maxOffset) offset=maxOffset;
			}
			else {
				if (offset < 0) {
					var minOffset = -elementIndex;
					if (offset < minOffset ) offset = minOffset;
				}
				else {
					// Then offset=0, so we do nothing
					return false;
				}
			}
			// offset is now an integer in range, and is not 0. 
			// And element is in sortedWindowList.
			var newIndex = elementIndex + offset;
			var elementCurrentlyInNewPosition = sortedWindowList[newIndex];
			if (offset > 0) {
				this.sendToFront(element,elementCurrentlyInNewPosition);
			}
			else {
				this.sendToBack(element,elementCurrentlyInNewPosition);
			}
			return true;
		}
		else {
			console.log('moveBy called with element that has not been added to ZIndexMgr.');
			return false;
		}
	} // end MoveBy
	//-----------------------------------------------------------------------------------------------------

	this.moveTo=function(element, rank) {
		// Moves element to the level described by the rank (positive integer) parameter.
		// For instance, moveTo(element,1) is the same as sendToFront(element); rank=1 is
		// at the front. Similarly, if sortedWindowList.length=n, then moveTo(element,n)
		// sends element to the back and is the same as sendToBack(element). element must
		// already be in sortedWindowList when moveTo is called, ie, you must have called
		// add(element) earlier. element can be the id of a DOM element or the id.
		sortedWindowList=this.sortByZIndex(sortedWindowList);
		if (typeof element == 'string') element=document.getElementById(element);
		var elementIndex = findObjInList(element, sortedWindowList);
		if (elementIndex != -1) {
			var n = sortedWindowList.length;
			if (!(Number.isInteger(rank) && rank > 0 && rank <= n)) {
				rank = Math.max(1, Math.min(Math.round(rank), n));
			}
			var offset = n - rank - elementIndex;
			this.moveBy(element,offset);
			return true;
		}
		else {
			return false;
		}	
	} // end moveTo
	//-----------------------------------------------------------------------------------------------------

	this.delete=function(element) {
		// Deletes element from sortedWindowList. element can be a DOM element
		// or the id of a DOM element. Returns true if element was deleted from
		// sortedWindowList, false otherwise.
		if (typeof element == 'string') element=document.getElementById(element);
		var isIn = findObjInList(element, sortedWindowList);
		if (isIn != -1) {
			sortedWindowList.splice(isIn,1); // Deletes one element at index isIn
			return true;
		}
		else {
			return false;
		}	
	} // end delete
	//-----------------------------------------------------------------------------------------------------

	this.topZIndex=function() {
		// Returns the highest zIndex value in sortedWindowList (as a number) or, 
		// if that list is empty, zStartingValue;
		if (sortedWindowList.length > 0) {
			sortedWindowList=this.sortByZIndex(sortedWindowList);
			var topElement=sortedWindowList[sortedWindowList.length-1];
			var style=window.getComputedStyle(topElement);
			var zIndex=parseFloat(style.zIndex);
		}
		else {
			zIndex=zStartingValue;
		}
		return zIndex;
	} // end topZIndex

	this.sortByZIndex=function(array) {
		// Sorts array by zIndex, biggest last in array.
		array.sort((a, b) => (window.getComputedStyle(a).zIndex > window.getComputedStyle(b).zIndex) ? 1 : -1);
		return array;
	}
	//-----------------------------------------------------------------------------------------------------

	this.zIndexList=function() {
		// Returns an array of z-Index values for sortedWindowList.
		sortedWindowList=this.sortByZIndex(sortedWindowList);
		var result=[]
		for (var i=0; i < sortedWindowList.length; i++) {
			var style = window.getComputedStyle(sortedWindowList[i]);
			result.push(parseInt(style.zIndex));
		}
		return result;
	} // end zIndexList
	//-----------------------------------------------------------------------------------------------------

	this.index=function(element) {
		// Returns the index of element in sortedWindowList. The higher
		// the index, the higher the window. Returns an integer between
		// 0 and sortedWindowList.length-1, or -1 if element is not in
		// sortedWindowList. element can be a DOM element or its Id.
		sortedWindowList=this.sortByZIndex(sortedWindowList);
		if (typeof element == 'string') element=document.getElementById(element);
		return findObjInList(element, sortedWindowList);
	}

	//*****************************************************************************************************
	// HELPER FUNCTIONS
	//*****************************************************************************************************

	function findObjInList(obj, list) {
		/* Returns the first index in list where obj is located.
		Returns -1 if no such index exists. */
		var i=0;
		while (i < list.length) {
			if (list[i].id == obj.id) {
				return i;
			}
			else {
				i++;
			}
		}
		return -1;
	} // end findObjInList
	//-----------------------------------------------------------------------------------------------------

	function resetZIndexValues() {
		// This gets called, if ever, when there has been so much sendToFronting
		// and sendToBacking that we have generated a fractional zIndex value.
		// Believe it or not, zIndex values must be integers, so we reset the
		// whole zIndex scheme. 
		var clone=sortedWindowList.slice(0);
		sortedWindowList=[];
		for (var i=0; i < clone.length; i++) {
			that.add(clone[i]);
		}
	} // end resetZIndexValue

	function initialize() {
		if (args.length > 0) {
			// You can initialize like so: var z = new ZIndexMgr('a1','b1','c1')
			// where 'a1','b1','c1' are id's of DOM elements you want to manage
			// the z-index's of with this manager. 'a1' will be lowest, 'c1' highest.
			for (var i=0; i < args.length; i++) {
				that.add(args[i]);
			}
		}
	} // end initialize

	//*****************************************************************************************************
	// INITIALIZATION
	//*****************************************************************************************************

	if (document.readyState === "complete" || document.readyState === "loaded") {
     // document is already ready to go
     	initialize();
	}
	else {
		// Execute initialize when DOM nodes exist.
		window.addEventListener('DOMContentLoaded', initialize, false);
	}
} // end ZIndexMgr