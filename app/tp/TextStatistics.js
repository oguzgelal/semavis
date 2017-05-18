// TextStatistics.js
// Christopher Giffard (2012)
// 1:1 API Fork of TextStatistics.php by Dave Child (Thanks mate!)
// https://github.com/DaveChild/Text-Statistics

(function(glob) {
	
	function cleanText(text) {

		// all these tags should be preceeded by a full stop. 
		var fullStopTags = ['li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dd'];
		
		fullStopTags.forEach(function(tag) {
			text = text.replace("</" + tag + ">",".");
		});
		
		text = text
			.replace(/<[^>]+>/g, "")				// Strip tags
			.replace(/[,:;()\/&+]|\-\-/g, " ")				// Replace commas, hyphens etc (count them as spaces)
			.replace(/[\.!?]/g, ".")					// Unify terminators
			.replace(/^\s+/, "")						// Strip leading whitespace
			.replace(/[\.]?(\w+)[\.]?(\w+)@(\w+)[\.](\w+)[\.]?/g, "$1$2@$3$4")	// strip periods in email addresses (so they remain counted as one word)
			.replace(/[ ]*(\n|\r\n|\r)[ ]*/g, ".")	// Replace new lines with periods
			.replace(/([\.])[\.]+/g, ".")			// Check for duplicated terminators
			.replace(/[ ]*([\.])/g, ". ")				// Pad sentence terminators
			.replace(/\s+/g, " ")						// Remove multiple spaces
			.replace(/\s+$/, "");					// Strip trailing whitespace
			
		if(text.slice(-1) != '.') {
			text += "."; 							// Add final terminator, just in case it's missing.
		}
		return text;
	}
	
	var TextStatistics = function TextStatistics(text) {
		this.text = text ? cleanText(text) : this.text;
	};



	// The main formula
	// RE = 206.835 – (1.015 x ASL) – (84.6 x ASW)
	TextStatistics.prototype.fleschKincaidReadingEase = function(text) {
		text = text ? cleanText(text) : this.text;
        var score = Math.round((206.835 - (1.015 * this.averageWordsPerSentence(text)) - (84.6 * this.averageSyllablesPerWord(text)))*10)/10;
		return score;
	};

	TextStatistics.prototype.textLength = function(text) {
		text = text ? cleanText(text) : this.text;
		return text.length;
	};
	
	TextStatistics.prototype.letterCount = function(text) {
		text = text ? cleanText(text) : this.text;
		text = text.replace(/[^a-z]+/ig,"");    //忽略大小写 /ig
 		return text.length;
	};
	
	TextStatistics.prototype.sentenceCount = function(text) {
		text = text ? cleanText(text) : this.text;
		return text.replace(/[^\.!?]/g, '').length || 1;		// /g 匹配所有可能的字串，可能会被U.K. MR. 等扰乱
	};
	
	TextStatistics.prototype.wordCount = function(text) {
		text = text ? cleanText(text) : this.text;
		return text.split(/[^a-z0-9\'@\.\-]+/i).length || 1;
	};
	
	TextStatistics.prototype.averageWordsPerSentence = function(text) {
		text = text ? cleanText(text) : this.text;
		return this.wordCount(text) / this.sentenceCount(text);  //为什么这里要加this.?
	};
	
	TextStatistics.prototype.averageSyllablesPerWord = function(text) {
		text = text ? cleanText(text) : this.text;
		var syllableCount = 0, wordCount = this.wordCount(text), self = this;
		
		text.split(/\s+/).forEach(function(word) {
			syllableCount += self.syllableCount(word);
		});
		
		// Prevent NaN...
		return (syllableCount||1) / (wordCount||1);
	};


	TextStatistics.prototype.syllableCount = function(word) {
		var syllableCount = 0,
			prefixSuffixCount = 0,
			wordPartCount = 0;
		
		// Prepare word - make lower case and remove non-word characters
		word = word.toLowerCase().replace(/[^a-z]/g,"");          //把字符转换成小写
	
		// Specific common exceptions that don't follow the rule set below are handled individually
		// Array of problem words (with word as key, syllable count as value)
		var problemWords = {
			"simile":		3,
			"forever":		3,
			"shoreline":	2
		};
		
		// Return if we've hit one of those...
		if (problemWords.hasOwnProperty(word)) return problemWords[word];
		
		// These syllables would be counted as two but should be one
		var subSyllables = [
			/cial/,
			/tia/,
			/cius/,
			/cious/,
			/giu/,
			/ion/,
			/iou/,
			/sia$/,
			/[^aeiuoyt]{2,}ed$/,
			/.ely$/,
			/[cg]h?e[rsd]?$/,
			/rved?$/,
			/[aeiouy][dt]es?$/,
			/[aeiouy][^aeiouydt]e[rsd]?$/,
			/^[dr]e[aeiou][^aeiou]+$/, // Sorts out deal, deign etc
			/[aeiouy]rse$/ // Purse, hearse
		];
	
		// These syllables would be counted as one but should be two
		var addSyllables = [
			/ia/,
			/riet/,
			/dien/,
			/iu/,
			/io/,
			/ii/,
			/[aeiouym]bl$/,
			/[aeiou]{3}/,
			/^mc/,
			/ism$/,
			/([^aeiouy])\1l$/,
			/[^l]lien/,
			/^coa[dglx]./,
			/[^gq]ua[^auieo]/,
			/dnt$/,
			/uity$/,
			/ie(r|st)$/
		];
	
		// Single syllable prefixes and suffixes
		var prefixSuffix = [
			/^un/,
			/^fore/,
			/ly$/,
			/less$/,
			/ful$/,
			/ers?$/,
			/ings?$/
		];
	
		// Remove prefixes and suffixes and count how many were taken
		prefixSuffix.forEach(function(regex) {
			if (word.match(regex)) {
				word = word.replace(regex,"");
				prefixSuffixCount ++;
			}
		});
		
		wordPartCount = word
			.split(/[^aeiouy]+/ig)
			.filter(function(wordPart) {
				return !!wordPart.replace(/\s+/ig,"").length;
			})
			.length;
		
		// Get preliminary syllable count...

		syllableCount = wordPartCount + prefixSuffixCount;
		
		// Some syllables do not follow normal rules - check for them
		subSyllables.forEach(function(syllable) {
			if (word.match(syllable)) syllableCount --;
		});
		
		addSyllables.forEach(function(syllable) {
			if (word.match(syllable)) syllableCount ++;
		});
		
		return syllableCount || 1;
	};
	
	function textStatistics(text) {
		return new TextStatistics(text);
	}
	
	(typeof module != "undefined" && module.exports) ? (module.exports = textStatistics) : (typeof define != "undefined" ? (define("textstatistics", [], function() { return textStatistics; })) : (glob.textstatistics = textStatistics));
})(this);

