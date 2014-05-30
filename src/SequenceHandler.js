(function(window){
	function SequenceHandler(stage, cWidth, cHeight, inputData){
		this.sequenceStage = stage;

		this.width  = cWidth;
		this.height = cHeight;
		this.sequenceIndex = 0;		// the current fraction pair
		this.sequenceOn = true;
		this.instruction = true;

		this.introSlides = [];
		this.introSlidesIndex = 0;

		// fixation time
		this.time = 500;	// in milliseconds
		this.timeRecorder = 0;	// used to keep track of time
		this.sessionTime = 60000 * 20;	// an hour
		this.sessionTimer = this.sessionTime; 

		this.correctCounter = 0;

		// how long can participant take on each problem
		this.timeOutTime = 3000;
		this.timeOutTimer = this.timeOutTime;
		this.timedOutSwitch = true;

		this.feedbackOn = false;

		this.line_a = {};
		this.line_b = {};
		this.line_c = {};
		this.line_d = {};

		// create the objects for fractions
		this.defineDrawObjects();

		// parses the inputdata, and start the sequence
		this.outPutData = inputData;
		this.parseInputData(inputData);
		this.startSequence();
	};


	// this function takes in a 2d array
	// Loops through the rows, and keeps track of specific columns
	//
	SequenceHandler.prototype.parseInputData = function(inputData) {
		
		var sequence = {};
		this.sequenceRowLength = inputData.length;
		this.sequence = inputData;
	};

	// will be reusing all the same objects, just changing them
	SequenceHandler.prototype.defineDrawObjects = function() {

		var SCALE = this.height * .4;
		var cw = this.width;
		var ch = this.height;

		
		for(var i = 1; i < 7; i ++){
			this.introSlides[i - 1] = new createjs.Bitmap("src/img/lines_align_" + i + ".jpg"); 
			this.introSlides[i - 1].visible = false;
		}

		this.endImg = new createjs.Bitmap("src/img/endtraining.jpg");
		this.endImg.visible = false;

		//  draws the fixation object
		this.fixation =  new createjs.Shape();
		this.fixation.graphics.setStrokeStyle(3).beginStroke("white");
		this.fixation.graphics.moveTo(cw *.5, ch* .4).lineTo(cw * .5, ch * .6);
		this.fixation.graphics.moveTo(cw * .4, ch * .5).lineTo(cw * .6, ch * .5);
		this.sequenceStage.addChild(this.fixation);


		// This code chunk manages the objects for
		// the nonsymbolic ratios
		this.l_line = new createjs.Shape();
		this.l_line.graphics.setStrokeStyle(10).beginStroke("white");

		this.r_line = new createjs.Shape();
		this.r_line.graphics.setStrokeStyle(10).beginStroke("white");
		
		this.l_click_area = new createjs.Shape();
		this.l_click_area.graphics.f('#AAAAAA').rr(-10,-10, 40, SCALE + 20,10);
		this.r_click_area = new createjs.Shape();
		this.r_click_area.graphics.f('#AAAAAA').rr(-10,-10, 40, SCALE + 20,10);
		
		this.l_line_ratio = new createjs.Container();
		this.l_line_ratio.addChild(this.l_click_area);
		this.l_line_ratio.addChild(this.l_line);		


		// define feedback text objects
		this.correctFeedbackText = new createjs.Text("correct", "24px Arial", "#FFFFFF");
		this.correctFeedbackText.x = .42 * cw;
		this.correctFeedbackText.y = .4 * ch;
		this.correctFeedbackText.visible = false;

		this.incorrectFeedbackText = new createjs.Text("incorrect", "24px Arial", "#FFFFFF");
		this.incorrectFeedbackText.x = .42 * cw;
		this.incorrectFeedbackText.y = .4 * ch;
		this.incorrectFeedbackText.visible = false;

		this.timeOutFeedbackText = new createjs.Text("too slow", "24px Arial", "#FFFFFF");
		this.timeOutFeedbackText.x = .42 * cw;
		this.timeOutFeedbackText.y = .4 * ch;
		this.timeOutFeedbackText.visible = false;

		/*
			This code chunk handles the click event for the left fraction.
			In the future, line ratio should be its own class
		*/
		var self = this;
		this.l_line_ratio.on("click", function(evt){

			if(self.sequenceIndex == (self.sequenceRowLength-1)){
				/*
					The sequence ends here. Do something...
					Submit a POST request with the statistics
				
				*/

			}
			else{

				if(self.sequence[self.sequenceIndex]["correct_side"] == "left"){
					/*
						Sequence is correct.
						Record data.
					*/

					//console.log(self.timeRecorder);
					//console.log(Date.now());

					var time = Date.now() - self.timeRecorder;
					time = convertMStoS(time, 3);

					self.outPutData[self.sequenceIndex]['correctness'] = "correct";
					self.outPutData[self.sequenceIndex]['side_selected'] = "left";
					self.outPutData[self.sequenceIndex]['rt'] = time;
					console.log("correct");

					self.correctCounter += 1;
					self.correctText.text = "correct: " + self.correctCounter;
					self.correctFeedbackText.visible = true;
				}
				else{
					/*
						Sequence is incorrect.
						Record data.
					*/
					//console.log(self.timeRecorder);
					//console.log(Date.now());

					var time = Date.now() - self.timeRecorder;
					time = convertMStoS(time, 3);

					self.outPutData[self.sequenceIndex]['correctness'] = "incorrect";
					self.outPutData[self.sequenceIndex]['side_selected'] = "left";
					self.outPutData[self.sequenceIndex]['rt'] = time;

					console.log("incorrect");
					self.incorrectFeedbackText.visible = true;
				}

				self.feedbackOn = true;
			}

			self.handleSequence();
		});


		/*
			This code chunk handles the click event for the right fraction.
			In the future, line ratio should be its own class
		*/
		this.r_line_ratio = new createjs.Container();
		this.r_line_ratio.addChild(this.r_click_area);
		this.r_line_ratio.addChild(this.r_line);



		this.r_line_ratio.on("click", function(evt){

			if(self.sequenceIndex == (self.sequenceRowLength-1)){
				/*
					The sequence ends here. Do something...
					Submit a POST request with the statistics
				
				*/

				console.log(self.sequence);
			}
			else{

				if(self.sequence[self.sequenceIndex]["correct_side"] == "right"){

					var time = Date.now() - self.timeRecorder;
					time = convertMStoS(time, 3);

					self.outPutData[self.sequenceIndex]['correctness'] = "correct";
					self.outPutData[self.sequenceIndex]['side_selected'] = "right";
					self.outPutData[self.sequenceIndex]['rt'] = time;
					console.log("correct");

					self.correctCounter += 1;
					self.correctText.text = "correct: " + self.correctCounter;
					self.correctFeedbackText.visible = true;
				}
				else{
					/*
						Sequence is incorrect.
						Record data.
					*/

					var time = Date.now() - self.timeRecorder;
					time = convertMStoS(time, 3);

					self.outPutData[self.sequenceIndex]['correctness'] = "incorrect";
					self.outPutData[self.sequenceIndex]['side_selected'] = "right";
					self.outPutData[self.sequenceIndex]['rt'] = time;

					console.log("incorrect");
					self.incorrectFeedbackText.visible = true;
				}

				self.feedbackOn = true;
			}

			self.handleSequence();
		});

		/*
		This chunk of code is responsible for the fraction.

		*/
		this.fraction_Container = new createjs.Container();

		// this code chunk takes care of the objects 
		// required to display the fraction
		this.divsionSign = new createjs.Shape();
		this.divsionSign.graphics.setStrokeStyle(3).beginStroke("white");
		this.divsionSign.graphics.moveTo(0, 40).lineTo(20, 40);

		this.numeratorText = new createjs.Text("--", "bold 36px Arial", "#ffffff");

		this.denominatorText = new createjs.Text("--", "bold 36px Arial", "#ffffff"); 
		this.denominatorText.y = 45;

		this.fraction_Container.x = cw * .48;
		this.fraction_Container.y = ch * .15;
		this.fraction_Container.addChild(this.numeratorText);
		this.fraction_Container.addChild(this.divsionSign);
		this.fraction_Container.addChild(this.denominatorText);

		// adds the elements to the canvas stage for display
		this.sequenceStage.addChild(this.fraction_Container);
		this.sequenceStage.addChild(this.l_line_ratio);
		this.sequenceStage.addChild(this.r_line_ratio);
		this.sequenceStage.addChild(this.correctFeedbackText);
		this.sequenceStage.addChild(this.incorrectFeedbackText);
		this.sequenceStage.addChild(this.timeOutFeedbackText);


		this.correctText = new createjs.Text("correct: 0", "bold 20px Arial", "#ffffff");
		this.correctText.x = .75 * cw;
		this.correctText.y = .01 * ch;

		this.sequenceStage.addChild(this.correctText);

		for(var i = 0; i < 6; i++){
			this.sequenceStage.addChild(this.introSlides[i]);
		}

		this.sequenceStage.addChild(this.endImg);
	}

	SequenceHandler.prototype.startSequence = function(){

		// resets the timer
		this.timeRecorder = -1;

		this.unShowFeedback();
		this.unShow();
		this.fixation.startTime = createCountDown(this.time);
		this.fixation.visible = true;
		this.handleSequence();
	}

	SequenceHandler.prototype.displayInstruction = function(){

		this.introSlides[this.introSlidesIndex].visible = true;


		var self = this;
		document.onkeydown = function checkKey(e){
			e = e || window.event;

			if(e.keyCode == 32){

				self.introSlides[self.introSlidesIndex].visible = false;



				self.introSlidesIndex++;

				if(self.introSlidesIndex == self.introSlides.length){
					self.instruction = false;
					console.log('instruction turned off');
					self.sessionTimer = createCountDown(self.sessionTime);
				}
			}
		}		
	}


	/*
	Currently just hides the fraction and nonysmbolic ratios.
	Can change to show statistics in the end, or to submit the
	POST request.
	*/
	SequenceHandler.prototype.displayEndSequence = function(){
		this.unShow();
		this.endImg.visible = true;
	}

	// this sequence loops continously 
	SequenceHandler.prototype.handleSequence = function(seq){

		/*
		// if this is during a transition
		if(this.feedbackTimerOn){
			if(this.feedbackTimer() < 0){

				// turn off the timer
				this.feedbackTimerOn = false;
				this.timedOutSwitch = true;
				// start next sequence
				this.sequenceIndex++;
				this.startSequence();
			}
		}
		*/
	
		if(this.feedbackOn){
			this.unShow();

			//DISPLAY FEEDBACK

			var self = this;
			document.onkeydown = function checkKey(e){
				e = e || window.event;

				if(e.keyCode == 32){
					console.log('key');

					self.feedbackOn = false;
					self.sequenceIndex++;
					self.startSequence();
				}
			}		

		}
		else if(this.fixationTimeOver() && this.sequenceOn){

			if(this.instruction){
				this.displayInstruction();
			}
			else{
				var num = this.sequence[this.sequenceIndex]["numerator"];
				var den = this.sequence[this.sequenceIndex]["denominator"];

				// if time ends
				if(this.sessionTimer() < 0 || this.sessionTimer() == 0){
					if(this.sequenceOn){
						this.sequenceOn = !this.sequenceOn;
					}

					// end the session
					this.displayEndSequence();
				}
				// if we are at the end of the dataset
				else if(this.sequenceIndex == (this.sequenceRowLength-1)){

					if(this.sequenceOn){
						this.sequenceOn = !this.sequenceOn;
					}

					this.displayEndSequence();
				}

				// general looping of sequence
				else{

					// displays the fraction

					if(this.timeRecorder == -1){
						this.timeRecorder = Date.now();
						this.timeOutTimer = createCountDown(this.timeOutTime);
					}
					
					//console.log(this.timeRecorder);
					this.showFraction(num, den);
					this.showNonSymbolicRatios();
					
					// if run out of time
					if(this.timeOutTimer() < 0){

						this.outPutData[this.sequenceIndex]['correctness'] = "incorrect";
						this.outPutData[this.sequenceIndex]['side_selected'] = "too slow";
						this.outPutData[this.sequenceIndex]['rt'] = this.timeOutTime;
						this.timeOutFeedbackText.visible = true;

						this.feedbackOn = true;
					}

				}
			}
		}// end of if statement

	}


	/*
	Hides the fraction and nonsymoblic ratios.
	*/
	SequenceHandler.prototype.unShow = function(){
		this.l_line_ratio.visible = false;
		this.r_line_ratio.visible = false;

		this.fraction_Container.visible = false;
		this.correctText.visible = false;
	}

	SequenceHandler.prototype.unShowFeedback = function(){
		this.correctFeedbackText.visible = false;
		this.incorrectFeedbackText.visible = false;
		this.timeOutFeedbackText.visible = false;
		
	}

	// this generates the image of the fixation. The param, time takes in
	// time in milliseconds and displays the fixation for that duration.
	SequenceHandler.prototype.displayFixation = function(time){

		this.fixation.startTime = createCountDown(time);
		this.sequenceStage.addChild(this.fixation);
	}


	// Checks to see if the fixation has exceed its time limit
	SequenceHandler.prototype.fixationTimeOver = function(){

		if(convertMStoS(this.fixation.startTime()) < 0 || convertMStoS(this.fixation.startTime()) == 0){
			this.fixation.visible = false;
			return true;
		}

		return false;
	};


	// Sets the visibility to true
	// assigns the numerator and denominator values
	SequenceHandler.prototype.showFraction = function(num, dem){

		if(!this.fraction_Container.visible){
			this.fraction_Container.visible = !this.fraction_Container.visible;
		}

		if(!this.correctText.visible){
			this.correctText.visible = !this.correctText.visible;
		}

		// changes the numerator and denominator values
		this.numeratorText.text = num;
		this.denominatorText.text = dem;

	}

	SequenceHandler.prototype.showNonSymbolicRatios = function(ratio1, ratio2, scale)
	{

		// get the ratios for the current sequence
		// denominators will be the scale

		line_a = {
			'length' : this.sequence[this.sequenceIndex]['a_length'],
			'top'	   : this.sequence[this.sequenceIndex]['a_top']
		}
		
		line_b = {
			'length' : this.sequence[this.sequenceIndex]['b_length'],
			'top'	   : this.sequence[this.sequenceIndex]['b_top']
		}

		line_c = {
			'length' : this.sequence[this.sequenceIndex]['c_length'],
			'top'	   : this.sequence[this.sequenceIndex]['c_top']
		}

		line_d = {
			'length' : this.sequence[this.sequenceIndex]['d_length'],
			'top'	   : this.sequence[this.sequenceIndex]['d_top']
		}

		var cw = this.width;
		var ch = this.height;

		// make visible
		this.l_line_ratio.visible = true;
		this.r_line_ratio.visible = true;

		// add background
		this.l_line_ratio.x = cw * .25;
		this.l_line_ratio.y = ch * .5;
		this.l_line.graphics.moveTo(0,(line_a.top * ch - this.l_line_ratio.y)).lineTo(0, line_a.length * ch);
		this.l_line.graphics.moveTo(20,(line_b.top * ch - this.l_line_ratio.y)).lineTo(20, line_b.length * ch);

		// add background
		this.r_line_ratio.x = cw * .75;
		this.r_line_ratio.y = ch * .5;
		this.r_line.graphics.moveTo(0,(line_c.top * ch - this.r_line_ratio.y)).lineTo(0, line_c.length * ch);
		this.r_line.graphics.moveTo(20,(line_d.top * ch - this.r_line_ratio.y)).lineTo(20, line_d.length * ch);

	}

	window.SequenceHandler = SequenceHandler;
}(window))