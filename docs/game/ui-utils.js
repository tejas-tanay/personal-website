// UI Utilities for Game Display
// Provides ASCII graphics and clean display functions

/**
 * Generate an ASCII progress bar
 * @param {number} value - Current value (0-100)
 * @param {number} width - Width of the bar in characters
 * @param {string} fillChar - Character used for filled portion 
 * @param {string} emptyChar - Character used for empty portion
 * @returns {string} ASCII progress bar
 */
function progressBar(value, width = 20, fillChar = '█', emptyChar = '░') {
    const fillWidth = Math.round((value / 100) * width);
    const emptyWidth = width - fillWidth;
    return fillChar.repeat(fillWidth) + emptyChar.repeat(emptyWidth);
}

/**
 * Display resource bars with ASCII graphics - more compact version
 * @param {Object} resources - Game resources object
 * @returns {string} Formatted ASCII resource display
 */
function resourceDisplay(resources) {
    const stabilityStatus = resources.stability < 30 ? "CRITICAL" : 
                            resources.stability < 50 ? "CONCERNING" : "STABLE";
    
    const trustStatus = resources.trust < 30 ? "STRAINED" : 
                        resources.trust < 50 ? "NEUTRAL" : "STRONG";
    
    const chaosStatus = resources.chaos > 70 ? "OVERWHELMING" : 
                        resources.chaos > 50 ? "CHALLENGING" : "MANAGEABLE";
    
    return `
┌─────────────────────────────────────────────────────┐
│ STABILITY [${progressBar(resources.stability)}] ${resources.stability.toString().padStart(3)}%
│ TRUST     [${progressBar(resources.trust)}] ${resources.trust.toString().padStart(3)}%
│ CHAOS     [${progressBar(resources.chaos)}] ${resources.chaos.toString().padStart(3)}%
└─────────────────────────────────────────────────────┘`;
}

/**
 * Create a framed event card display - more compact version
 * @param {Object} event - Event card object
 * @returns {string} ASCII framed event display
 */
function eventCardDisplay(event) {
    // Format description and context to fit within frame
    const wrapText = (text, maxWidth = 60) => {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        });
        
        if (currentLine) lines.push(currentLine);
        return lines;
    };
    
    const descriptionLines = wrapText(event.description);
    const contextLines = wrapText(event.context);
    
    let result = `
┌─────────────────────── SITUATION ───────────────────────┐`;
    
    // Add description
    descriptionLines.forEach(line => {
        result += `\n│ ${line.padEnd(60)} │`;
    });
    
    // Add separator and context header
    result += `\n├───────────────────── BACKGROUND ───────────────────────┤`;
    
    // Add context
    contextLines.forEach(line => {
        result += `\n│ ${line.padEnd(60)} │`;
    });
    
    // Add bottom frame
    result += `\n└─────────────────────────────────────────────────────────┘`;
    
    return result;
}

/**
 * Display choices in a menu format - more compact version
 * @param {Array} choices - Array of choice objects
 * @returns {string} Formatted choice menu
 */
function choiceMenuDisplay(choices) {
    const wrapText = (text, indent = 2, maxWidth = 60) => {
        const indentStr = ' '.repeat(indent);
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length > maxWidth) {
                lines.push(indentStr + currentLine);
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        });
        
        if (currentLine) lines.push(indentStr + currentLine);
        return lines.join('\n');
    };
    
    let result = `
┌─────────────────────── OPTIONS ───────────────────────┐`;
    
    choices.forEach((choice, index) => {
        result += `\n│                                                     │
│ [${index}] ${choice.option}
${wrapText(choice.description)}`;
        
        if (index < choices.length - 1) {
            result += `\n├─────────────────────────────────────────────────────┤`;
        }
    });
    
    result += `\n└─────────────────────────────────────────────────────┘`;
    
    return result;
}

/**
 * Display outcome with ASCII graphics - more compact version
 * @param {Object} choice - The chosen option
 * @param {Object} outcomes - Resource changes and score impacts
 * @returns {string} Formatted outcome display
 */
function outcomeDisplay(choice, outcomes) {
    const wrapText = (text, maxWidth = 58) => {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        });
        
        if (currentLine) lines.push(currentLine);
        return lines.map(line => `│ ${line.padEnd(maxWidth)} │`).join('\n');
    };

    let result = `
┌─────────────────────── OUTCOME ───────────────────────┐
${wrapText(choice.outcomeDescription)}
├─────────────────────── RESULTS ───────────────────────┤`;
    
    // Display immediate outcomes with arrow indicators
    for (const [resource, delta] of Object.entries(outcomes.immediateOutcome)) {
        const formattedResource = resource.charAt(0).toUpperCase() + resource.slice(1);
        const sign = delta > 0 ? "+" : "";
        const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "─";
        result += `\n│ ${formattedResource.padEnd(10)} ${arrow} ${sign}${delta.toString().padStart(2)}                                    │`;
    }
    
    // Display score impact if any
    if (outcomes.futureImpact && outcomes.futureImpact.score) {
        const score = outcomes.futureImpact.score;
        const sign = score > 0 ? "+" : "";
        const arrow = score > 0 ? "↑" : score < 0 ? "↓" : "─";
        result += `\n│ ${"Score".padEnd(10)} ${arrow} ${sign}${score.toString().padStart(2)}                                    │`;
    }
    
    result += `\n└─────────────────────────────────────────────────────┘`;
    
    return result;
}

/**
 * Display final score with ASCII art
 * @param {Object} state - Final game state
 * @param {number} finalScore - Calculated final score
 * @param {string} title - Earned title
 * @returns {string} Formatted final score display
 */
function finalScoreDisplay(state, finalScore, title, projectName) {
    const rating = 
        finalScore >= 200 ? "OUTSTANDING SUCCESS" :
        finalScore >= 150 ? "SUCCESSFUL COMPLETION" :
        finalScore >= 100 ? "ACCEPTABLE RESULTS" :
                           "TROUBLED PROJECT";
    
    const trophyArt = finalScore >= 200 ? `
       ___________
      '._==_==_=_.'
      .-\\:      /-.
     | (|:.     |) |
      '-|:.     |-'
        \\::.    /
         '::. .'
           ) (
         _.' '._
        '-------'` : 
    finalScore >= 150 ? `
        ______
       |_|  |_|
       |_|__|_|
      /|_|__|_|\\
     /_/|__|__|\\_\\
    |___|__|__|___|
        |__|__|
        |__|__|
        |__|__|
        |__|__|` :
    finalScore >= 100 ? `
       _______
      |       |
      |       |
      |_______|
      \\       /
       \\     /
        \\___/` :
    `
    .-.
    | |
    | |
    |_|
    (_)`;
    
    return `
┌─────────────────── PROJECT CONCLUSION ────────────────────┐
│                                                          │
│  PROJECT: ${projectName.padEnd(48)}  │
│  STATUS: ${rating.padEnd(50)}  │
│                                                          │
${trophyArt.split('\n').map(line => `│${line.padEnd(58)}│`).join('\n')}
│                                                          │
├───────────────────── FINAL RESULTS ─────────────────────┤
│                                                          │
│  Stability: ${state.resources.stability.toString().padStart(3)}                                         │
│  Trust:     ${state.resources.trust.toString().padStart(3)}                                         │
│  Chaos:     ${state.resources.chaos.toString().padStart(3)}                                         │
│  Project Score: ${state.score.toString().padStart(3)}                                     │
│                                                          │
│  FINAL SCORE: ${finalScore.toString().padStart(3)}                                    │
│  TITLE: ${title.padEnd(50)}  │
└──────────────────────────────────────────────────────────┘`;
}

/**
 * ASCII splash screen for game start
 * @returns {string} ASCII splash screen
 */
function splashScreen() {
    return `
 ██████╗  █████╗ ███╗   ███╗███████╗     ██████╗ ███████╗
██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██╔═══██╗██╔════╝
██║  ███╗███████║██╔████╔██║█████╗      ██║   ██║█████╗  
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ██║   ██║██╔══╝  
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ╚██████╔╝██║     
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝     ╚═════╝ ╚═╝     
                                                         
██████╗ ██╗ ██████╗ ██╗████████╗ █████╗ ██╗               
██╔══██╗██║██╔════╝ ██║╚══██╔══╝██╔══██╗██║               
██║  ██║██║██║  ███╗██║   ██║   ███████║██║               
██║  ██║██║██║   ██║██║   ██║   ██╔══██║██║               
██████╔╝██║╚██████╔╝██║   ██║   ██║  ██║███████╗          
╚═════╝ ╚═╝ ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝          
                                                         
██████╗  ██████╗ ██╗     ██╗████████╗██╗ ██████╗███████╗  
██╔══██╗██╔═══██╗██║     ██║╚══██╔══╝██║██╔════╝██╔════╝  
██████╔╝██║   ██║██║     ██║   ██║   ██║██║     ███████╗  
██╔═══╝ ██║   ██║██║     ██║   ██║   ██║██║     ╚════██║  
██║     ╚██████╔╝███████╗██║   ██║   ██║╚██████╗███████║  
╚═╝      ╚═════╝ ╚══════╝╚═╝   ╚═╝   ╚═╝ ╚═════╝╚══════╝  
                                                          `;
}

/**
 * Quick start guide display
 * @returns {string} Formatted quick start guide
 */
function quickStartGuide() {
    return `
┌─────────────────────── QUICK START GUIDE ───────────────────────┐
│                                                                 │
│  Welcome to the Game of Digital Politics!                       │
│                                                                 │
│  You are a project manager leading a critical government        │
│  digital service project. Your goal is to successfully          │
│  deliver the project while managing three key resources:        │
│                                                                 │
│  • STABILITY - Technical reliability of your system             │
│  • TRUST - Your relationship with the Ministry                  │
│  • CHAOS - The level of unpredictability in your project        │
│                                                                 │
│  Each turn, you'll face a situation requiring a decision.       │
│  Your choices will affect your resources and Project Score.     │
│                                                                 │
│  At the end, your final score determines your success:          │
│  FINAL SCORE = Project Score + Stability + Trust - Chaos        │
│                                                                 │
│  Type 'h' during any choice to see the help screen.             │
│                                                                 │
│  Good luck!                                                     │
└─────────────────────────────────────────────────────────────────┘`;
}

// Export the functions
module.exports = {
    progressBar,
    resourceDisplay,
    eventCardDisplay,
    choiceMenuDisplay,
    outcomeDisplay,
    finalScoreDisplay,
    splashScreen,
    quickStartGuide
}; 