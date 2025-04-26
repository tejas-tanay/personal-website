// Game of Digital Politics - Optimized Implementation
const ui = require('./ui-utils.js');

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

/**
 * Core game logic functions
 */

// Draw a random card from the deck
function drawRandomCard(cards) {
    if (!cards || cards.length === 0) {
        throw new Error("No cards available to draw");
    }
    const index = Math.floor(Math.random() * cards.length);
    return cards[index];
}

// Quantal Response Model for decision making
function quantalResponse(value, noise) {
    if (noise <= 0) {
        throw new Error("Noise parameter must be positive");
    }
    return Math.exp(value / noise);
}

// Simulate future turns with limited foresight
function simulateLimitedBackwardInduction(state, depth, params) {
    if (depth <= 0) return 0;
    
    // This could be improved with actual simulation of future cards
    // Current implementation uses a simple heuristic
    const avgFuture = 5 + (state.resources.trust - state.resources.chaos) / 10;
    
    return params.discountFactor * (avgFuture + 
           simulateLimitedBackwardInduction(state, depth - 1, params));
}

// Evaluate a choice based on immediate and future impacts
function evaluateChoice(choice, state, params) {
    // Calculate immediate value from resource changes
    const immediateValue = (choice.immediateOutcome.trust || 0) + 
                          (choice.immediateOutcome.stability || 0) - 
                          (choice.immediateOutcome.chaos || 0);
    
    // Calculate future impact
    const futureImpact = choice.futureImpact(state).score || 0;
    
    // Simulate future turns with limited foresight
    const foresightValue = simulateLimitedBackwardInduction(
        {...state}, params.foresightDepth, params
    );
    
    // Total value combines immediate, explicit future, and simulated future
    const totalValue = immediateValue + futureImpact + foresightValue;
    
    return {
        rawValue: totalValue,
        responseValue: quantalResponse(totalValue, params.decisionNoise)
    };
}

// Apply choice outcomes to game state
function applyOutcome(state, choice) {
    // Create a copy of the state to avoid direct mutation
    const newState = {
        ...state,
        resources: {...state.resources}
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
    const futureImpact = choice.futureImpact(state);
    newState.score += futureImpact.score || 0;
    
    // Add to log
    newState.log.push(`Turn ${state.turn}: ${choice.option}`);
    
    return newState;
}

// Display information to the player
function display(message) {
    console.log(message);
    // In a real implementation, this would interact with UI
}

// Get text input from the player
function getTextInput(prompt) {
    return new Promise((resolve) => {
        console.log(prompt);
        
        // Set up stdin to receive input
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        // Handle the input
        process.stdin.once('data', (data) => {
            resolve(data.trim());
        });
    });
}

// Get player input - implementing actual player input
function getPlayerInput(choices) {
    // Return a Promise that resolves with the player's choice
    return new Promise((resolve) => {
        console.log("\nEnter the number of your choice (0-" + (choices.length - 1) + ") or 'h' for help:");
        
        // Set up stdin to receive input
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        // Handle the input
        process.stdin.once('data', (data) => {
            const input = data.trim().toLowerCase();
            
            // Check for help command
            if (input === 'h' || input === 'help') {
                showHelpScreen();
                // Ask again after showing help
                getPlayerInput(choices).then(resolve);
                return;
            }
            
            const choice = parseInt(input);
            
            // Validate input
            if (isNaN(choice) || choice < 0 || choice >= choices.length) {
                console.log("Invalid choice. Please try again.");
                // Ask again recursively
                getPlayerInput(choices).then(resolve);
            } else {
                resolve(choice);
            }
        });
    });
}

/**
 * Show a help screen with game mechanics explanation
 */
function showHelpScreen() {
    console.log("\n" + "=".repeat(70));
    console.log("HELP SCREEN");
    console.log("=".repeat(70));
    
    console.log("\nRESOURCE GUIDE:");
    console.log("• STABILITY - Technical reliability of your system");
    console.log("  Higher stability means fewer crashes and better performance");
    console.log("  Lower stability increases the risk of system failures and user complaints");
    
    console.log("\n• TRUST - Your relationship with the Ministry and stakeholders");
    console.log("  Higher trust gives you more freedom and support from the Ministry");
    console.log("  Lower trust means more scrutiny and micromanagement");
    
    console.log("\n• CHAOS - The level of unpredictability in your project");
    console.log("  Higher chaos means unexpected challenges and emergencies");
    console.log("  Lower chaos allows for better planning and execution");
    
    console.log("\nSCORE SYSTEM:");
    console.log("• PROJECT SCORE - Accumulates from the long-term impact of your decisions");
    console.log("• FINAL SCORE = Project Score + Stability + Trust - Chaos");
    
    console.log("\nPress Enter to continue...");
    process.stdin.once('data', () => {
        // Clear the console and redisplay the current game state
        // This would need custom handling based on where in the game flow help was called
        console.log("\nReturning to game...\n");
    });
}

// Calculate final score and title
function calculateEndgame(state) {
    const finalScore = state.score + 
                      state.resources.trust + 
                      state.resources.stability - 
                      state.resources.chaos;
    
    let title;
    if (finalScore >= 200) title = "Digital Dynamo";
    else if (finalScore >= 150) title = "Bureaucracy Whisperer";
    else title = "Aspiring Vendor";
    
    return { finalScore, title };
}

/**
 * Main game loop
 */
async function runGame(quickStart = false) {
    // Clear the console to start fresh
    console.clear();
    
    // Setup game narrative with ASCII splash screen
    console.log(ui.splashScreen());
    
    if (!quickStart) {
        // Ask if the player wants quick start mode
        console.log("\nWould you like to:");
        console.log("[0] Quick Start - Jump straight into the game with minimal introduction");
        console.log("[1] Full Experience - Read the complete backstory and game rules");
        
        // Get choice
        const startChoice = await new Promise(resolve => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.once('data', (data) => {
                const choice = data.trim();
                resolve(choice === "0" ? true : false);
            });
        });
        
        if (startChoice) {
            // If they selected quick start, call this function again with quickStart=true
            return runGame(true);
        }
    }
    
    // Quick intro for quick start mode
    if (quickStart) {
        gameState.playerName = await getTextInput("Enter your name:");
        gameState.projectName = await getTextInput("What would you like to name your digital service project?");
        
        console.clear();
        console.log(ui.quickStartGuide());
        
        // Wait for player to continue
        await new Promise(resolve => {
            console.log("\nPress Enter to begin your journey...");
            process.stdin.once('data', () => resolve());
        });
    } else {
        // Original full introduction
        gameState.playerName = await getTextInput("Enter your name:");
        gameState.projectName = await getTextInput("What would you like to name your digital service project?");
        
        // Show game introduction with personalized elements
        const intro = gameContext.introduction
            .replace("%MINISTRY_NAME%", gameState.ministryName);
        
        console.clear();
        console.log("\n" + "=".repeat(60) + "\n");
        console.log(intro);
        console.log("\n" + "=".repeat(60) + "\n");
        
        // Show resource explanations after the introduction
        console.log("\n" + "-".repeat(60));
        console.log("UNDERSTANDING THE SCORE SYSTEM:");
        console.log("Your choices affect both immediate resources (Stability, Trust, Chaos) and your Project Score.");
        console.log("");
        console.log("• Each choice has immediate effects shown as resource changes.");
        console.log("• Choices also have long-term effects on your Project Score, representing future consequences.");
        console.log("• At the end, FINAL SCORE = Project Score + Stability + Trust - Chaos");
        console.log("• Higher final score means better project outcomes and career advancement.");
        console.log("-".repeat(60));
        
        // Start message
        console.log(`\nWelcome, ${gameState.playerName}. Your project "${gameState.projectName}" begins now.`);
        console.log("The Minister is counting on you to deliver this critical service successfully.");
        console.log("You have 20 turns (development cycles) to complete the project.");
        
        // Wait for player to continue
        await new Promise(resolve => {
            console.log("\nPress Enter to begin your journey...");
            process.stdin.once('data', () => resolve());
        });
    }
    
    // Clone the initial state to avoid mutations
    let currentState = JSON.parse(JSON.stringify(gameState));
    
    try {
        while (currentState.turn < currentState.totalTurns) {
            // Next turn
            currentState.turn++;
            
            // Clear the console for clean display
            console.clear();
            
            // Show minimal cycle indicator and resource status with ASCII graphics
            console.log(`\n${currentState.turn}/${currentState.totalTurns} - PROJECT: ${currentState.projectName}`);
            console.log(ui.resourceDisplay(currentState.resources));
            console.log(`  Project Score: ${currentState.score}`);
            
            // Draw a card and display it with ASCII frame
            const currentCard = drawRandomCard(eventCards);
            console.log(ui.eventCardDisplay(currentCard));
            
            // Display choices with ASCII menu
            console.log(ui.choiceMenuDisplay(currentCard.choices));
            
            // Get player choice with await
            const playerChoiceIndex = await getPlayerInput(currentCard.choices);
            const chosen = currentCard.choices[playerChoiceIndex];
            
            // Apply outcome
            currentState = applyOutcome(currentState, chosen);
            
            // Display outcome with ASCII graphics
            console.log(ui.outcomeDisplay(chosen, {
                immediateOutcome: chosen.immediateOutcome,
                futureImpact: chosen.futureImpact(currentState)
            }));
            
            // Critical resource warnings - only show if needed
            let hasWarnings = false;
            
            if (currentState.resources.stability <= 30) {
                console.log("\n⚠️  System stability CRITICAL");
                hasWarnings = true;
            }
            if (currentState.resources.trust <= 30) {
                console.log("⚠️  Ministry trust STRAINED");
                hasWarnings = true;
            }
            if (currentState.resources.chaos >= 70) {
                console.log("⚠️  Project chaos OVERWHELMING");
                hasWarnings = true;
            }
            
            // Press Enter to continue
            if (currentState.turn < currentState.totalTurns) {
                await new Promise(resolve => {
                    console.log(hasWarnings ? "\nPress Enter for next cycle..." : "\nPress Enter...");
                    process.stdin.once('data', () => resolve());
                });
            }
        }
        
        // Calculate final score and display results
        const { finalScore, title } = calculateEndgame(currentState);
        
        // More descriptive ending based on score
        let endingDescription;
        if (finalScore >= 200) {
            endingDescription = `Your management of ${gameState.projectName} has been extraordinary. The Minister personally commends you at the launch ceremony, and your digital service is featured in international media as an example of government innovation. Your company is flooded with new contract offers, and you're promoted to the executive team.`;
        } else if (finalScore >= 150) {
            endingDescription = `${gameState.projectName} launches successfully with minor issues. The Ministry is satisfied with your work and extends your contract for maintenance and future enhancements. Your approach to navigating bureaucracy while delivering quality has impressed many stakeholders.`;
        } else if (finalScore >= 100) {
            endingDescription = `${gameState.projectName} launches with several compromises and technical debt. While functional, the service suffers from occasional outages and user complaints. The Ministry renews your contract with reduced scope and stricter oversight.`;
        } else {
            endingDescription = `${gameState.projectName} is considered a troubled project. Launch is delayed multiple times, and when finally released, critical issues plague the service. The Ministry does not renew your contract, and your company's reputation suffers significantly.`;
        }
        
        // Clear console for final display
        console.clear();
        
        // Display ending description
        console.log("\n" + "=".repeat(70));
        console.log(endingDescription);
        console.log("=".repeat(70) + "\n");
        
        // Show final score with ASCII trophy art
        console.log(ui.finalScoreDisplay(currentState, finalScore, title, gameState.projectName));
        
        // Close stdin
        process.stdin.pause();
        
        return { finalState: currentState, finalScore, title };
    } catch (error) {
        display(`Game error: ${error.message}`);
        // Close stdin
        process.stdin.pause();
        return { error: error.message };
    }
}

// Export game functions for testing or external use
module.exports = {
    runGame,
    gameState,
    parameters,
    eventCards,
    evaluateChoice,
    calculateEndgame
};

// Run the game
runGame(); 