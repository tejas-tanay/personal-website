// Game of Digital Politics - Browser-compatible Implementation

/**
 * Game state and configuration
 */
const gameState = {
    turn: 0,
    totalTurns: 20,
    resources: { stability: 50, trust: 50, chaos: 0 },
    score: 0,
    log: [],
    projectName: "",
    playerName: "",
    ministryName: "Ministry of Digital Affairs"
};

const parameters = {
    decisionNoise: 0.2,    // Higher noise means more randomness in evaluations
    discountFactor: 0.9,   // Future payoffs are discounted by this factor per turn
    foresightDepth: 3      // Limit player foresight to this many turns ahead
};

/**
 * Story context and resource explanations
 */
const gameContext = {
    introduction: `You've been appointed as the Lead Project Manager at TechFuture Solutions, 
    contracted to build a crucial digital service for the government's %MINISTRY_NAME%.
    
    Your digital service will impact millions of citizens, from tax payments to healthcare access.
    If you succeed, you'll secure your company's reputation and future contracts.
    If you fail, public services could be disrupted, and your company might not recover.
    
    You must balance three critical factors:
    
    STABILITY: The technical reliability of your system
    ↑ Higher stability means fewer crashes and better performance
    ↓ Lower stability increases the risk of system failures and public outrage
    
    TRUST: Your relationship with the Ministry and stakeholders
    ↑ Higher trust gives you more freedom and support from the Ministry
    ↓ Lower trust means more scrutiny, micromanagement, and risk of contract termination
    
    CHAOS: The level of unpredictability in your project
    ↑ Higher chaos means unexpected challenges and emergencies
    ↓ Lower chaos allows for better planning and execution
    
    Your PROJECT SCORE tracks the long-term success of your decisions. Each choice you make 
    has immediate effects on your resources, but also long-term impacts on your overall 
    project success. Some decisions may seem good in the short term but harm your project 
    in the long run, while others may be painful initially but pay off later.
    
    At the end of the project, your final score will be calculated as:
    FINAL SCORE = Your accumulated score + Trust level + Stability level - Chaos level
    
    This final score determines the ultimate success of your project and your career prospects!
    
    Every decision affects these factors and your overall score. Choose wisely!`,
    
    resourceExplanations: {
        stability: "Represents your system's technical reliability. Stability is crucial for user satisfaction and avoiding media scandals.",
        trust: "Represents your relationship with the Ministry. Trust determines how much autonomy you have and affects contract renewals.",
        chaos: "Represents unpredictability in your project. High chaos makes planning difficult and increases the risk of emergencies.",
        score: "Represents the long-term success of your project beyond the immediate resource changes. Each decision has future impacts that affect this score."
    }
};

/**
 * Event cards collection with rich descriptions and implications
 */
const eventCards = [
    {
        id: "offline_mode",
        description: "The Ministry demands offline mode functionality for rural areas with poor connectivity.",
        context: "Rural citizens have been complaining to their representatives about being unable to access services when internet is spotty. The Minister is facing political pressure to solve this issue immediately.",
        choices: [
            { 
                option: "Implement Offline Mode", 
                description: "Dedicate your top engineers to build a robust offline solution that syncs when connectivity returns. This will require significant architecture changes.",
                immediateOutcome: { stability: -10, trust: +15, chaos: 0 },
                futureImpact: (state) => ({ score: +10 }),
                outcomeDescription: "Your team works overtime to deliver a solid offline mode. The Ministry is impressed with your commitment, though your stability temporarily suffers from the rushed implementation."
            },
            { 
                option: "Delay the Upgrade", 
                description: "Explain to the Ministry that proper offline functionality requires extensive planning. Propose a phased approach with a longer timeline.",
                immediateOutcome: { stability: 0, trust: +5, chaos: +5 },
                futureImpact: (state) => ({ score: +2 }),
                outcomeDescription: "The Ministry reluctantly accepts your proposal. They appreciate your honesty, but uncertainty about the timeline introduces some chaos into the project."
            },
            { 
                option: "Submit as-is", 
                description: "Argue that offline mode wasn't in the original requirements. Offer minimal changes that don't fundamentally address the issue.",
                immediateOutcome: { stability: 0, trust: -10, chaos: +10 },
                futureImpact: (state) => ({ score: -5 }),
                outcomeDescription: "Your refusal damages your relationship with the Ministry. They begin micromanaging other aspects of the project, and rural users continue experiencing problems."
            }
        ]
    },
    {
        id: "security_audit",
        description: "The Ministry has ordered a surprise security audit following recent high-profile government data breaches.",
        context: "A neighboring department had citizen data leaked last month. The Minister is worried about political fallout if your project has similar vulnerabilities. Security experts will thoroughly examine your codebase and infrastructure.",
        choices: [
            { 
                option: "Prepare extensively", 
                description: "Cancel all feature work for two weeks. Conduct an internal audit first, fix vulnerabilities, and prepare comprehensive documentation for the auditors.",
                immediateOutcome: { stability: +10, trust: +10, chaos: -5 },
                futureImpact: (state) => ({ score: +5 }),
                outcomeDescription: "Your preparation impresses the auditors. They find only minor issues, and the Ministry praises your security-first approach. Your thorough work strengthens the system's stability."
            },
            { 
                option: "Standard preparation", 
                description: "Balance ongoing feature work with reasonable audit preparation. Have your security team review critical components and prepare necessary documentation.",
                immediateOutcome: { stability: +5, trust: 0, chaos: 0 },
                futureImpact: (state) => ({ score: 0 }),
                outcomeDescription: "The audit reveals several moderate issues but no critical vulnerabilities. The Ministry is neither impressed nor disappointed. You've maintained the status quo."
            },
            { 
                option: "Last-minute preparation", 
                description: "Continue prioritizing feature development until just before the audit. Scramble at the last minute to prepare documentation and brief your team.",
                immediateOutcome: { stability: -5, trust: -10, chaos: +10 },
                futureImpact: (state) => ({ score: -10 }),
                outcomeDescription: "The audit is a disaster. Auditors find multiple security vulnerabilities that could have compromised citizen data. The Ministry questions your competence and puts you on probation."
            }
        ]
    },
    {
        id: "budget_cut",
        description: "The Ministry announces a 15% budget cut to all digital initiatives due to changing government priorities.",
        context: "A new administration has shifted focus to other policy areas. Your project's funding will be reduced immediately, forcing you to make difficult decisions about resources allocation.",
        choices: [
            { 
                option: "Reduce team size", 
                description: "Let go of junior developers and non-essential roles. Remaining team members will have to take on additional responsibilities.",
                immediateOutcome: { stability: -15, trust: +5, chaos: +10 },
                futureImpact: (state) => ({ score: -5 }),
                outcomeDescription: "The layoffs hurt team morale and stability, but the Ministry appreciates your budget compliance. The remaining team is overworked, increasing the risk of burnout and errors."
            },
            { 
                option: "Cut features", 
                description: "Propose removing several planned features to meet the new budget while maintaining your current team and quality standards.",
                immediateOutcome: { stability: +5, trust: -10, chaos: +5 },
                futureImpact: (state) => ({ score: -3 }),
                outcomeDescription: "The Ministry is frustrated by the reduced scope. Your system remains stable, but stakeholders question whether you'll deliver sufficient value. Some requirements become unclear as features are cut."
            },
            { 
                option: "Renegotiate contract", 
                description: "Push back on the cuts by demonstrating the public impact of your service. Propose extending the timeline instead of reducing scope or quality.",
                immediateOutcome: { stability: 0, trust: -5, chaos: -5 },
                futureImpact: (state) => ({ score: +8 }),
                outcomeDescription: "After tense meetings, you secure most of your original budget in exchange for a longer delivery timeline. This creates a more predictable environment but slightly strains Ministry relations."
            }
        ]
    },
    {
        id: "new_technology",
        description: "A cutting-edge authentication technology promises enhanced security with minimal implementation effort.",
        context: "This technology is being adopted by leading tech companies and offers better protection against identity theft. It would require integration work but could position your service as a government innovation leader.",
        choices: [
            { 
                option: "Adopt early", 
                description: "Be among the first government projects to implement this technology. Dedicate resources to integration and promote this decision to stakeholders.",
                immediateOutcome: { stability: -5, trust: +10, chaos: +5 },
                futureImpact: (state) => ({ score: state.resources.trust > 60 ? +15 : +5 }),
                outcomeDescription: "The Ministry is impressed by your innovation. There are some initial integration challenges, but if you've maintained good relationships, stakeholders remain patient through the transition."
            },
            { 
                option: "Wait and see", 
                description: "Monitor the technology's adoption in the private sector. Plan for potential future implementation while focusing on current priorities.",
                immediateOutcome: { stability: +5, trust: 0, chaos: 0 },
                futureImpact: (state) => ({ score: +3 }),
                outcomeDescription: "Your cautious approach maintains system stability. When the technology is eventually adopted by other government services, you're well-prepared to implement it smoothly."
            },
            { 
                option: "Ignore technology", 
                description: "Dismiss the technology as unnecessary for your project. Stick with your current authentication system and focus resources elsewhere.",
                immediateOutcome: { stability: +10, trust: -5, chaos: -5 },
                futureImpact: (state) => ({ score: -7 }),
                outcomeDescription: "Short-term stability improves as you avoid any transition, but the Ministry questions your commitment to security innovation. Your system eventually appears outdated compared to other services."
            }
        ]
    },
    {
        id: "team_burnout",
        description: "After months of intense work, your development team is showing clear signs of burnout and decreasing productivity.",
        context: "Missed deadlines are increasing. Team members are calling in sick more frequently, and code quality is declining. If not addressed, this could seriously impact your ability to deliver.",
        choices: [
            { 
                option: "Enforce vacation time", 
                description: "Mandate that team members take at least one week of vacation. Temporarily pause feature development to focus on sustainable work practices.",
                immediateOutcome: { stability: -5, trust: 0, chaos: -10 },
                futureImpact: (state) => ({ score: +12 }),
                outcomeDescription: "Productivity initially drops, but after the break, your team returns energized. Team cohesion improves, reducing unexpected issues and creating a more predictable work environment."
            },
            { 
                option: "Team building activities", 
                description: "Organize team lunches, social events, and recognition ceremonies. Acknowledge the hard work while trying to maintain the current pace.",
                immediateOutcome: { stability: 0, trust: +5, chaos: -5 },
                futureImpact: (state) => ({ score: +5 }),
                outcomeDescription: "The Ministry appreciates your effort to maintain momentum while supporting your team. Morale improves temporarily, creating some stability in your work environment."
            },
            { 
                option: "Ignore and push forward", 
                description: "Focus on meeting the upcoming deadlines at all costs. Remind the team of the project's importance and the consequences of failure.",
                immediateOutcome: { stability: +5, trust: -5, chaos: +15 },
                futureImpact: (state) => ({ score: -15 }),
                outcomeDescription: "Short-term deadlines are met, but at a devastating cost. Key team members resign, critical bugs are missed due to exhaustion, and the project enters a crisis state."
            }
        ]
    }
];

// UI Components for Browser
const UI = {
    // Generate ASCII progress bar
    progressBar: function(value, width = 20, fillChar = '█', emptyChar = '░') {
        const fillWidth = Math.round((value / 100) * width);
        const emptyWidth = width - fillWidth;
        return fillChar.repeat(fillWidth) + emptyChar.repeat(emptyWidth);
    },
    
    // Display resources
    resourceDisplay: function(resources) {
        return `
┌─────────────────────────────────────────────────────┐
│ STABILITY [${this.progressBar(resources.stability)}] ${resources.stability.toString().padStart(3)}%
│ TRUST     [${this.progressBar(resources.trust)}] ${resources.trust.toString().padStart(3)}%
│ CHAOS     [${this.progressBar(resources.chaos)}] ${resources.chaos.toString().padStart(3)}%
└─────────────────────────────────────────────────────┘`;
    },
    
    // Display splash screen
    splashScreen: function() {
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
╚═╝      ╚═════╝ ╚══════╝╚═╝   ╚═╝   ╚═╝ ╚═════╝╚══════╝`;
    },
    
    // Quick start guide display
    quickStartGuide: function() {
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
};

// Game functions
const Game = {
    // DOM elements
    output: document.getElementById('game-output'),
    input: document.getElementById('game-input'),
    choicesContainer: document.getElementById('choices-container'),
    gameContainer: document.getElementById('game-container'),
    fullscreenButton: document.getElementById('fullscreen-button'),
    
    // Game state
    state: JSON.parse(JSON.stringify(gameState)),
    currentCard: null,
    gameOver: false,
    awaitingInput: false,
    inputCallback: null,
    isFullscreen: false,
    
    // Initialize game
    init: function() {
        this.output.textContent = UI.splashScreen() + "\n\nWelcome to the Game of Digital Politics!\n\nPress Enter to start...";
        this.input.focus();
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = this.input.value.trim();
                this.input.value = '';
                
                if (this.inputCallback) {
                    this.inputCallback(value);
                }
            }
            
            // Add F key as fullscreen shortcut
            if (e.key === 'f' && e.ctrlKey) {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });
        
        // Set up fullscreen button
        this.fullscreenButton.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        this.awaitingInput = true;
        this.inputCallback = () => this.startGame();
    },
    
    // Toggle fullscreen mode
    toggleFullscreen: function() {
        this.isFullscreen = !this.isFullscreen;
        
        if (this.isFullscreen) {
            this.gameContainer.classList.add('fullscreen');
            document.body.classList.add('game-fullscreen');
        } else {
            this.gameContainer.classList.remove('fullscreen');
            document.body.classList.remove('game-fullscreen');
        }
        
        // Focus on input after toggling fullscreen
        setTimeout(() => {
            this.input.focus();
        }, 100);
        
        // Scroll to ensure text is visible
        this.output.scrollTop = this.output.scrollHeight;
    },
    
    // Print to game console
    print: function(text) {
        this.output.textContent += "\n" + text;
        this.output.scrollTop = this.output.scrollHeight;
    },
    
    // Clear the game console
    clear: function() {
        this.output.textContent = '';
    },
    
    // Wrap text to fit within a specified width
    wrapText: function(text, maxWidth = 58) {
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
    },
    
    // Get input from player
    getInput: function(prompt) {
        return new Promise(resolve => {
            this.print(prompt);
            this.awaitingInput = true;
            this.inputCallback = (value) => {
                this.awaitingInput = false;
                resolve(value);
            };
        });
    },
    
    // Show help screen
    showHelpScreen: async function() {
        this.print("\n" + "=".repeat(70));
        this.print("HELP SCREEN");
        this.print("=".repeat(70));
        
        this.print("\nRESOURCE GUIDE:");
        this.print("• STABILITY - Technical reliability of your system");
        this.print("  Higher stability means fewer crashes and better performance");
        this.print("  Lower stability increases the risk of system failures and user complaints");
        
        this.print("\n• TRUST - Your relationship with the Ministry and stakeholders");
        this.print("  Higher trust gives you more freedom and support from the Ministry");
        this.print("  Lower trust means more scrutiny and micromanagement");
        
        this.print("\n• CHAOS - The level of unpredictability in your project");
        this.print("  Higher chaos means unexpected challenges and emergencies");
        this.print("  Lower chaos allows for better planning and execution");
        
        this.print("\nSCORE SYSTEM:");
        this.print("• PROJECT SCORE - Accumulates from the long-term impact of your decisions");
        this.print("• FINAL SCORE = Project Score + Stability + Trust - Chaos");
        
        this.print("\nKEYBOARD SHORTCUTS:");
        this.print("• Press 'h' anytime during a choice to show this help screen");
        this.print("• Press 'Ctrl+F' to toggle fullscreen mode");
        this.print("• Press '0-9' to quickly select options by their number");
        
        await this.getInput("\nPress Enter to return to the game...");
        
        // Redisplay the current game state
        this.displayGameState();
    },
    
    // Display current game state - used after returning from help screen
    displayGameState: function() {
        if (!this.currentCard) return;
        
        this.print(`\n${this.state.turn}/${this.state.totalTurns} - PROJECT: ${this.state.projectName}`);
        this.print(UI.resourceDisplay(this.state.resources));
        this.print(`  Project Score: ${this.state.score}`);
        
        // Display card
        this.print(`\n┌─────────────────────── SITUATION ───────────────────────┐`);
        const descLines = this.wrapText(this.currentCard.description);
        descLines.forEach(line => {
            this.print(`│ ${line.padEnd(60)} │`);
        });
        
        this.print(`├───────────────────── BACKGROUND ───────────────────────┤`);
        const contextLines = this.wrapText(this.currentCard.context);
        contextLines.forEach(line => {
            this.print(`│ ${line.padEnd(60)} │`);
        });
        this.print(`└─────────────────────────────────────────────────────────┘`);
        
        // Display choices
        this.print(`\n┌─────────────────────── OPTIONS ───────────────────────┐`);
        this.currentCard.choices.forEach((choice, index) => {
            this.print(`│                                                     │`);
            this.print(`│ [${index}] ${choice.option}`);
            
            const descLines = this.wrapText(choice.description, 55);
            descLines.forEach(line => {
                this.print(`│   ${line.padEnd(56)} │`);
            });
            
            if (index < this.currentCard.choices.length - 1) {
                this.print(`├─────────────────────────────────────────────────────┤`);
            }
        });
        this.print(`└─────────────────────────────────────────────────────────┘`);
        this.print(`\nEnter the number of your choice (0-${this.currentCard.choices.length - 1}) or 'h' for help:`);
        
        // Show choice buttons
        this.displayChoices(this.currentCard.choices);
    },
    
    // Start the game
    startGame: async function() {
        this.clear();
        
        // Ask if the player wants quick start mode
        this.print("Would you like to:");
        this.print("[0] Quick Start - Jump straight into the game with minimal introduction");
        this.print("[1] Full Experience - Read the complete backstory and game rules");
        
        // Get choice
        const startChoice = await this.getInput("\nEnter your choice (0 or 1):");
        const quickStart = startChoice === "0";
        
        this.clear();
        this.print("Please enter your name:");
        
        this.state.playerName = await this.getInput("");
        
        this.print("What would you like to name your digital service project?");
        this.state.projectName = await this.getInput("");
        
        this.clear();
        
        if (quickStart) {
            // Show quick start guide
            this.print(UI.quickStartGuide());
            
            await this.getInput("\nPress Enter to begin your journey...");
        } else {
            // Show introduction
            const intro = gameContext.introduction.replace("%MINISTRY_NAME%", this.state.ministryName);
            this.print(intro);
            
            await this.getInput("\nPress Enter to begin your journey...");
        }
        
        // Start game loop
        this.gameLoop();
    },
    
    // Draw a random card
    drawRandomCard: function() {
        const index = Math.floor(Math.random() * eventCards.length);
        return eventCards[index];
    },
    
    // Display choices
    displayChoices: function(choices) {
        this.choicesContainer.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = `[${index}] ${choice.option}`;
            button.addEventListener('click', () => {
                if (this.awaitingInput && this.inputCallback) {
                    this.inputCallback(index.toString());
                }
            });
            this.choicesContainer.appendChild(button);
        });
        
        // Add help button
        const helpButton = document.createElement('button');
        helpButton.className = 'choice-button';
        helpButton.textContent = '[h] Help';
        helpButton.addEventListener('click', () => {
            if (this.awaitingInput && this.inputCallback) {
                this.inputCallback('h');
            }
        });
        this.choicesContainer.appendChild(helpButton);
    },
    
    // Apply outcome of a choice
    applyOutcome: function(choice) {
        // Create a copy of the state to avoid direct mutation
        const newState = {
            ...this.state,
            resources: {...this.state.resources}
        };
        
        // Apply immediate resource changes
        for (const [resource, delta] of Object.entries(choice.immediateOutcome)) {
            if (newState.resources[resource] !== undefined) {
                newState.resources[resource] += delta;
                // Ensure resources stay within reasonable bounds
                newState.resources[resource] = Math.max(0, newState.resources[resource]);
                newState.resources[resource] = Math.min(100, newState.resources[resource]);
            }
        }
        
        // Apply future impact to score
        const futureImpact = choice.futureImpact(this.state);
        newState.score += futureImpact.score || 0;
        
        // Add to log
        newState.log.push(`Turn ${this.state.turn}: ${choice.option}`);
        
        this.state = newState;
    },
    
    // Calculate final score
    calculateEndgame: function() {
        const finalScore = this.state.score + 
                          this.state.resources.trust + 
                          this.state.resources.stability - 
                          this.state.resources.chaos;
        
        let title;
        if (finalScore >= 200) title = "Digital Dynamo";
        else if (finalScore >= 150) title = "Bureaucracy Whisperer";
        else if (finalScore >= 100) title = "Capable Manager";
        else title = "Aspiring Vendor";
        
        let endingDescription;
        if (finalScore >= 200) {
            endingDescription = `Your management of ${this.state.projectName} has been extraordinary. The Minister personally commends you at the launch ceremony, and your digital service is featured in international media as an example of government innovation. Your company is flooded with new contract offers, and you're promoted to the executive team.`;
        } else if (finalScore >= 150) {
            endingDescription = `${this.state.projectName} launches successfully with minor issues. The Ministry is satisfied with your work and extends your contract for maintenance and future enhancements. Your approach to navigating bureaucracy while delivering quality has impressed many stakeholders.`;
        } else if (finalScore >= 100) {
            endingDescription = `${this.state.projectName} launches with several compromises and technical debt. While functional, the service suffers from occasional outages and user complaints. The Ministry renews your contract with reduced scope and stricter oversight.`;
        } else {
            endingDescription = `${this.state.projectName} is considered a troubled project. Launch is delayed multiple times, and when finally released, critical issues plague the service. The Ministry does not renew your contract, and your company's reputation suffers significantly.`;
        }
        
        return { finalScore, title, endingDescription };
    },
    
    // Game loop
    gameLoop: async function() {
        while (this.state.turn < this.state.totalTurns && !this.gameOver) {
            // Next turn
            this.state.turn++;
            
            // Clear the console
            this.clear();
            
            // Show turn and resources
            this.print(`\n${this.state.turn}/${this.state.totalTurns} - PROJECT: ${this.state.projectName}`);
            this.print(UI.resourceDisplay(this.state.resources));
            this.print(`  Project Score: ${this.state.score}`);
            
            // Draw a card
            this.currentCard = this.drawRandomCard();
            
            // Display card
            this.print(`\n┌─────────────────────── SITUATION ───────────────────────┐`);
            const descLines = this.wrapText(this.currentCard.description);
            descLines.forEach(line => {
                this.print(`│ ${line.padEnd(60)} │`);
            });
            
            this.print(`├───────────────────── BACKGROUND ───────────────────────┤`);
            const contextLines = this.wrapText(this.currentCard.context);
            contextLines.forEach(line => {
                this.print(`│ ${line.padEnd(60)} │`);
            });
            this.print(`└─────────────────────────────────────────────────────────┘`);
            
            // Display choices
            this.print(`\n┌─────────────────────── OPTIONS ───────────────────────┐`);
            this.currentCard.choices.forEach((choice, index) => {
                this.print(`│                                                     │`);
                this.print(`│ [${index}] ${choice.option}`);
                
                const descLines = this.wrapText(choice.description, 55);
                descLines.forEach(line => {
                    this.print(`│   ${line.padEnd(56)} │`);
                });
                
                if (index < this.currentCard.choices.length - 1) {
                    this.print(`├─────────────────────────────────────────────────────┤`);
                }
            });
            this.print(`└─────────────────────────────────────────────────────────┘`);
            
            // Show choice buttons
            this.displayChoices(this.currentCard.choices);
            
            // Get player choice with validation
            let validChoice = false;
            let playerChoiceIndex;
            let chosen;
            
            while (!validChoice) {
                const input = await this.getInput("\nEnter the number of your choice (0-" + (this.currentCard.choices.length - 1) + ") or 'h' for help:");
                
                if (input.toLowerCase() === 'h') {
                    await this.showHelpScreen();
                    continue;
                }
                
                playerChoiceIndex = parseInt(input);
                
                if (isNaN(playerChoiceIndex) || playerChoiceIndex < 0 || playerChoiceIndex >= this.currentCard.choices.length) {
                    this.print("Invalid choice. Please try again.");
                    continue;
                }
                
                validChoice = true;
                chosen = this.currentCard.choices[playerChoiceIndex];
            }
            
            // Apply outcome
            this.applyOutcome(chosen);
            
            // Display outcome
            this.print(`\n┌─────────────────────── OUTCOME ───────────────────────┐`);
            const outcomeLines = this.wrapText(chosen.outcomeDescription);
            outcomeLines.forEach(line => {
                this.print(`│ ${line.padEnd(58)} │`);
            });
            this.print(`├─────────────────────── RESULTS ───────────────────────┤`);
            
            // Display immediate outcomes with arrow indicators
            for (const [resource, delta] of Object.entries(chosen.immediateOutcome)) {
                const formattedResource = resource.charAt(0).toUpperCase() + resource.slice(1);
                const sign = delta > 0 ? "+" : "";
                const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "─";
                this.print(`│ ${formattedResource.padEnd(10)} ${arrow} ${sign}${delta.toString().padStart(2)}                                    │`);
            }
            
            // Display score impact if any
            const futureImpact = chosen.futureImpact(this.state);
            if (futureImpact && futureImpact.score) {
                const score = futureImpact.score;
                const sign = score > 0 ? "+" : "";
                const arrow = score > 0 ? "↑" : score < 0 ? "↓" : "─";
                this.print(`│ ${"Score".padEnd(10)} ${arrow} ${sign}${score.toString().padStart(2)}                                    │`);
            }
            
            this.print(`└─────────────────────────────────────────────────────────┘`);
            
            // Critical resource warnings - only show if needed
            let hasWarnings = false;
            
            if (this.state.resources.stability <= 30) {
                this.print("\n⚠️  System stability CRITICAL");
                hasWarnings = true;
            }
            if (this.state.resources.trust <= 30) {
                this.print("⚠️  Ministry trust STRAINED");
                hasWarnings = true;
            }
            if (this.state.resources.chaos >= 70) {
                this.print("⚠️  Project chaos OVERWHELMING");
                hasWarnings = true;
            }
            
            // Press Enter to continue if not the last turn
            if (this.state.turn < this.state.totalTurns) {
                await this.getInput(hasWarnings ? "\nPress Enter for next cycle..." : "\nPress Enter...");
            }
        }
        
        // Game over - calculate final score
        const { finalScore, title, endingDescription } = this.calculateEndgame();
        
        // Clear console for final display
        this.clear();
        
        // Display ending
        this.print("\n" + "=".repeat(70));
        const endingLines = this.wrapText(endingDescription, 68);
        endingLines.forEach(line => {
            this.print(line);
        });
        this.print("=".repeat(70) + "\n");
        
        // Final score
        this.print(`\n┌─────────────────── PROJECT CONCLUSION ────────────────────┐`);
        this.print(`│                                                          │`);
        this.print(`│  PROJECT: ${this.state.projectName.padEnd(48)}  │`);
        this.print(`│  STATUS: ${finalScore >= 200 ? "OUTSTANDING SUCCESS" : 
                           finalScore >= 150 ? "SUCCESSFUL COMPLETION" : 
                           finalScore >= 100 ? "ACCEPTABLE RESULTS" : 
                           "TROUBLED PROJECT"}  │`);
        this.print(`│                                                          │`);
        this.print(`│                                                          │`);
        this.print(`├───────────────────── FINAL RESULTS ─────────────────────┤`);
        this.print(`│                                                          │`);
        this.print(`│  Stability: ${this.state.resources.stability.toString().padStart(3)}                                         │`);
        this.print(`│  Trust:     ${this.state.resources.trust.toString().padStart(3)}                                         │`);
        this.print(`│  Chaos:     ${this.state.resources.chaos.toString().padStart(3)}                                         │`);
        this.print(`│  Project Score: ${this.state.score.toString().padStart(3)}                                     │`);
        this.print(`│                                                          │`);
        this.print(`│  FINAL SCORE: ${finalScore.toString().padStart(3)}                                    │`);
        this.print(`│  TITLE: ${title.padEnd(50)}  │`);
        this.print(`└──────────────────────────────────────────────────────────┘`);
        
        // Play again option
        this.print("\nGame Over. Thank you for playing!");
        this.print("\nRefresh the page to play again.");
        
        this.choicesContainer.innerHTML = '';
        const restartButton = document.createElement('button');
        restartButton.className = 'choice-button';
        restartButton.textContent = 'Restart Game';
        restartButton.addEventListener('click', () => {
            location.reload();
        });
        this.choicesContainer.appendChild(restartButton);
        
        this.gameOver = true;
    }
};

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
}); 