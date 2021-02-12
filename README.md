# ZIndexMgr
A JavaScript zIndex manager for managing dynamic zIndex layers

	//**************************************************************************************************
	ZIndexMgr.js DOCUMENTATION
	//**************************************************************************************************
	
	AUTHOR: JIM ANDREWS, VISPO.COM
	
	SUMMARY---------------------------------------------------------------------------------------------

	This manages the z-index values of the windows/containers (usually divs) in your web app.

	Read these to understand zIndex: 
	https://www.freecodecamp.org/news/z-index-explained-how-to-stack-elements-using-css-7c5aa0f179b3/  
	https://philipwalton.com/articles/what-no-one-told-you-about-z-index/
	https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context 
	https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index 

	Create one ZIndexMgr to manage the z-Index values of your main windows/layers/containers. All
	the windows you manage with a given instance of ZIndexMgr should have the same parent. If you 
	want also to manage other windows that have a different parent, create a different instance
	of ZIndexMgr to manage those windows/containers. The windows/containers managed by a given
	instance of ZIndexMgr need to be part of the same "stacking context" (see above URLs).

	To create a ZIndexMgr:

	var z = new ZIndexMgr(element1, element2, ... elementn);

	where the parameters are DOM elements (or their IDs) that all have the same parent. These
	DOM elements are containers of which you want the z-index values managed by an instance
	of ZIndexMgr. 

	When a DOM element is added, it is sent to front. In the above, element1 is added first. 
	Then element2, and so on. Consequently, element1 has the lowest z-index among the parameters. 
	element2 is second lowest. And so on. elementn is the highest container, ie, it has the 
	highest z-index.

	You can add other containers later on:

	z.add('a1');
	z.add('b1');
	var c1 = document.getElementById('c1');
	z.add(c1);

	where 'a1' and 'b1' are the id's of DOM elements of which you want the z-index managed.

	API--------------------------------------------------------------------------------------------------

	z.add(element)                  --add a DOM element window/container so its zIndex is managed
	z.sendToFront(element)          --send element window/container to front of all managed containers
	z.sendToFront(element,element2) --send element in front of element2
	z.sendToBack(element)           --send element to back of managed containers
	z.moveBy(element,offset)        --elevate element by offset levels or, if offset is negative, lower it
	z.moveTo(element,rank)          --place element at the level of height described by rank
	z.windowList()                  --returns the array of managed windows/containers sorted by z-index
	z.delete(element)               --no longer manage the z-index of container element
	z.topZIndex()                   --returns the (integer) current top z-index.
	z.zIndexList()                  --returns an array the same length as sortedWindowList and contains the z-index of each managed window
	z.index(element)                --returns the index into sortedWindowList where element is located

	add(element) 

	// This method registers a window/container for the ZIndexMgr to manage.
	// This sets the element/window to be on top. So when you add your
	// windows when the program starts (after loading), call the add method
	// first on the window you want to be at the bottom and then call the add
	// method in ascending z-Index order. The element must be either an HTML element
	// or the id of an HTML element. 

	sendToFront(element, element2)

	// Sends element in front of element2 (and behind anything in front of element2).
	// If element2 is omitted, element is sent to the front of all managed windows.
	// element and element2 can be DOM elements or the id's of DOM elements. They 
	// must both have been added to the manager.
	// Returns true if the operation was successfully carried out, false otherwise.

	sendToBack(element, element2)

	// Sends element behind element2 (and in front of anything behind element2).
	// If element2 is omitted, element is sent to the back of all windows.
	// element and element2 can be DOM elements or the id's of DOM elements.
	// Both must have been added to the manager.
	// Returns true if the operation was successfully carried out, false otherwise.

	moveBy(element, offset)

	// If offset is a positive integer, moveBy elevates element over that
	// many intervening windows. If offset is a negative integer, moveBy
	// lowers element below that many intervening windows. If offset is 
	// larger than the actual number of intervening windows, element is 
	// simply elevated to the top of all windows. Similarly, if offset 
	// is negative and is less than the number of windows below element,
	// then element is simply lowered to the bottom of all the windows.
	// Returns true if the operation was successful, and false otherwise.

	moveTo(element, rank)

	// Moves element to the level described by the rank (positive integer) parameter.
	// For instance, moveTo(element,1) is the same as sendToFront(element); rank=1 is
	// at the front. Similarly, if sortedWindowList.length=n, then moveTo(element,n)
	// sends element to the back and is the same as sendToBack(element). element must
	// already be in sortedWindowList when moveTo is called, ie, you must have called
	// add(element) earlier. element can be the id of a DOM element or the id.
	// Returns true if the operation was successful, false otherwise. 

	delete(element)

	// Deletes element from sortedWindowList. element can be a DOM element
	// or the id of a DOM element. Returns true if element was deleted from
	// sortedWindowList, false otherwise. Call this if/when you don't want
	// element's z-index managed by the manager anymore.

	topZIndex()

	// Returns the highest zIndex value in sortedWindowList (as a number) or, 
	// if that list is empty, returns zStartingValue;

	zIndexList() 

	// Returns an array of z-Index values, one for each of the elements in sortedWindowList.

	index(element) 

	// Returns the index of element in sortedWindowList. The higher
	// the index, the higher the window. Returns an integer between
	// 0 and sortedWindowList.length-1, or -1 if element is not in
	// sortedWindowList. element can be a DOM element or its Id.

	DESCRIPTION----------------------------------------------------------------------------------------, 

	var z = new ZIndexMgr('lowestContainerId','midContainerId','highestContainerId');

	creates a ZIndexMgr and adds three windows/containers of which you want the z-index values managed.

	When you add a window/container, it is sent to the front. It is given a z-Index value by the code.
	The z-Index values used are quite large. They start at 1073741824 (2^30). z-Index values must be
	integers. That's why we use big powers of 2, so that we can find intermediary integer values for
	a very long time before having to reset the z-Index values.

	You may--but don't have to--give children of windows/layers/containers z-Index values. But you
	don't manage them with their parent's manager.

	Also, each window/layer/container must hava a CSS position property that is 'positioned', ie, a
	value other than the default 'static' value. If this is not the case, then when you add the
	window/layer/container to the ZIndexMgr, it will set the CSS position property to 'absolute'. 
	This is because z-Index has no effect on non-positioned elements. 

	You must also give each window/layer/container a unique id.

	To send element to the front of all windows (element must already have been added to z):

	z.sendToFront(element);

	Again, the element is either a DOM element already added, or the id of that element.

	To send element to be in front of element2 (assuming element2 is itself a window/container/layer)
	and behind any managed windows in front of element2:

	z.sendToFront(element, element2);

	Again, the parameters can be DOM elements already added or the id's of such elements.

	There's a similar method called sendToBack, which is exactly like sendToFront only you're sending
	stuff to back, not to front. Like sendToFront, it can be called with one or two parameters. 

	There's also 

	z.moveBy(element, integer);

	where element is a window container DOM node or the id of one, and integer is the (positive or
	negative) integer indicating how many places to move element in sortedWindowList. For instance,
	if sortedWindowList=[x,b,c,d] and we call

	z.moveBy(x, 2);

	then sortedWindowList=[b,c,x,d] and x will have a z-Index value that places the x window between
	c and d.

	If sortedWindowList=[a,b,c,x] and we call

	z.moveBy(x,-3)

	then sortedWindowList=[x,a,b,c] and x will have a z-Index value that places it below the rest. If 
	sortedWindowList=[x,a,b,c] and you call

	z.moveBy(x,4)

	then the result is sortedWindowList=[a,b,c,x]

	which is the same as if you'd called

	z.moveBy(x,3)

	In other words, if the integer parameter is out of range, then moveBy trims it to be in range.

	z.delete(element);

	The above line deletes element, which is a DOM element or its Id, from sortedWindowList, but 
	does not destroy the element. It is simply no longer managed by ZIndexMgr.
