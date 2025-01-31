class Organism {
    constructor(name, count, huntProb, lowFoodLimit, currentFoodCount, foodUsage, matingProb, foodSource, foodAvailable) {
        this.name = name;
        this.count = count;
        this.huntProb = huntProb;
        this.lowFoodLimit = lowFoodLimit;
        this.currentFoodCount = currentFoodCount;
        this.foodUsage = foodUsage;
        this.matingProb = matingProb;
        this.foodSource = foodSource;
        this.foodAvailable = foodAvailable;
    }

    dailyRoutine(ecosystem) {
        this.currentFoodCount -= this.foodUsage * this.count;

        if (this.currentFoodCount <= this.lowFoodLimit * this.count) {
            this.hunt(ecosystem);
        }
        
        this.reproduce();

        this.count = Math.max(0, this.count);

        if (this.currentFoodCount <= 0) {
            this.count = Math.max(this.count - 1, 0);
            this.currentFoodCount = 0;
        }
    }

    set setHuntProb(value) {
        this.huntProb = value;
    }    
    hunt(ecosystem) {
        let potentialFood = ecosystem.filter(org => this.foodSource.includes(org.name));
        const MAX_HUNT_ATTEMPTS = 5;  // limit to the number of hunting attempts
    
        for (let food of potentialFood) {
            let attempts = 0;
    
            while (this.currentFoodCount <= this.lowFoodLimit * this.count && food.count > 0 && attempts < MAX_HUNT_ATTEMPTS) {
                if (Math.random() < this.huntProb) {
                    this.currentFoodCount += this.foodAvailable;
                    food.count--;
                }
    
                attempts++;
            }
        }
    }
    
    
    
    reproduce() {
        const freeLand = MAX_LAND_CAPACITY - landUsage;
        const reproductionPotential = Math.floor(this.count * this.matingProb);
        const actualReproduction = Math.min(reproductionPotential, freeLand);

        if (this.name !== "Grass" && this.name !== "Weed" && this.currentFoodCount < this.foodUsage * this.count) {
            // If it's an animal and it doesn't have enough food, then reproduction does not occur
            return;
        }

        this.count += actualReproduction;
        landUsage += actualReproduction;
    }
}

const MAX_LAND_CAPACITY = 5000;


function generateOrganismHTML(organism) {
    const div = document.createElement('div');
    div.classList.add('organism');
    div.id = organism.name;
    
    const h3 = document.createElement('h3');
    h3.innerText = organism.name;
    div.appendChild(h3);
    
    const p = document.createElement('p');
    p.innerHTML = `Count: <span id="${organism.name}-count">${organism.count}</span>`;
    div.appendChild(p);

    return div;
}

const organismsData = [
    { name: "Rabbit", args: [0.45, 100, 200, 1, 0.5, ["Grass", "Weed"], 1] },
    { name: "Fox", args: [0.35, 10, 50, 3, 0.4, ["Rabbit"], 30] },
    { name: "Deer", args: [0.4, 120, 250, 2, 0.6, ["Grass"], 2] },
    { name: "Coyote", args: [0.3, 15, 30, 2.5, 0.3, ["Rabbit", "Deer"], 20] },
    { name: "Bobcat", args: [0.25, 12, 30, 2.2, 0.35, ["Rabbit"], 25] },

    { name: "Sparrow", args: [0.25, 10, 50, 0.5, 0.6, ["Grasshopper", "Wildflower"], 1] },
    { name: "Hawk", args: [0.35, 5, 20, 1.5, 0.3, ["Sparrow", "Rabbit"], 10] },

    { name: "Grass", args: [0, 0, 4000, 0.2, 0.6, [], 0] },
    { name: "Wildflower", args: [0, 0, 150, 0.15, 0.8, [], 0] },
    { name: "Shrub", args: [0, 0, 300, 0.3, 0.4, [], 0] },
    { name: "Tree", args: [0, 0, 1000, 1.5, 0.2, [], 0] },
    { name: "Weed", args: [0, 0, 1000, 0.2, 0.65, [], 0] },


    { name: "Butterfly", args: [0.2, 0, 50, 0.05, 0.7, ["Wildflower"], 0] },
    { name: "Beetle", args: [0.25, 0, 40, 0.08, 0.5, ["Shrub"], 0] },
    { name: "Grasshopper", args: [0.3, 0, 30, 0.06, 0.6, ["Grass"], 0] },
    { name: "Ant", args: [0.2, 0, 20, 0.03, 0.6, ["Tree"], 0] },
];

const ecosystem = [];
const history = {};

// Create a temporary array to store initial counts
const initialCounts = {};

// Read and store initial counts from session storage
organismsData.forEach(orgData => {
    const count = sessionStorage.getItem(`${orgData.name}Count`);
    initialCounts[orgData.name] = isNaN(count) || count < 0 ? 0 : parseInt(count);
});

// ...

// Modify the getInitialCount function to use the initialCounts array
function getInitialCount(organismName) {
    return initialCounts[organismName];
}

organismsData.forEach(orgData => {
    const count = getInitialCount(orgData.name);
    if (count > 0) {
        ecosystem.push(new Organism(orgData.name, count, ...orgData.args));
        console.log();
        history[orgData.name] = []; // Initialize an empty array for the included organism in the history object
        generateOrganismHTML(orgData);
    }
});

const organismsContainer = document.getElementById('organismsContainer');
ecosystem.forEach(organism => {
    organismsContainer.appendChild(generateOrganismHTML(organism));
});





// ... The Organism class and ecosystem array are as provided above ...

const events = [
    {
        name: "Drought",
        duration: 3,
        effect: (ecosystem) => {
            let rabbit = ecosystem.find(org => org.name === "Rabbit");
            if (rabbit) {
                rabbit.originalHuntProb = rabbit.originalHuntProb || rabbit.huntProb;
                rabbit.huntProb *= 0.7;
            }
        },
        endEffect: (ecosystem) => {
            let rabbit = ecosystem.find(org => org.name === "Rabbit");
            if (rabbit && rabbit.originalHuntProb) {
                rabbit.huntProb = rabbit.originalHuntProb;
                delete rabbit.originalHuntProb;
            }
        },
        message: "A drought has occurred! Droughts severely affect the availability of water, which impacts both plants and animals. Without enough water, plants may not grow as fast or even die, leading to a decrease in food availability for herbivores like rabbits. As you'll see, this can cascade and impact predators like foxes too."
    },
    {
        name: "Disease Outbreak",
        duration: 2,  // Lasts for 2 days
        effect: (ecosystem) => {
            let affectedOrganism = ecosystem[Math.floor(Math.random() * ecosystem.length)];
            const affectedCount = Math.floor(affectedOrganism.count * 0.4);  // 40% gets affected
            affectedOrganism.count -= affectedCount;
            alert(`Disease has affected the ${affectedOrganism.name}s! ${affectedCount} have died.`);
        },
        endEffect: (ecosystem) => {
            alert("The disease outbreak has ended.");
        },
        message: "A disease outbreak has occurred! Diseases can drastically reduce the population of affected species."
    },
    {
        name: "Predator Invasion",
        duration: 4,
        effect: (ecosystem) => {
            let fox = ecosystem.find(org => org.name === "Fox");
            if (fox) {
                fox.originalHuntProb = fox.originalHuntProb || fox.huntProb;
                fox.huntProb *= 1.5; // Increase fox's hunting probability during predator invasion
            }
        },
        endEffect: (ecosystem) => {
            let fox = ecosystem.find(org => org.name === "Fox");
            if (fox && fox.originalHuntProb) {
                fox.huntProb = fox.originalHuntProb;
                delete fox.originalHuntProb;
            }
        },
        message: "A predator invasion has occurred! An influx of predators can lead to a change in predator-prey dynamics. Predators like foxes may hunt more frequently during this period."
    },
    {
        name: "Bumper Crop",
        duration: 2,
        effect: (ecosystem) => {
            let grass = ecosystem.find(org => org.name === "Grass");
            if (grass) {
                grass.foodAvailable *= 2; // Double the available food for herbivores
            }
        },
        endEffect: (ecosystem) => {
            let grass = ecosystem.find(org => org.name === "Grass");
            if (grass) {
                grass.foodAvailable /= 2; // Restore the original food availability
            }
        },
        message: "A bumper crop has occurred! This event leads to an abundance of plants like grass, providing more food for herbivores. Herbivore populations may thrive during this period."
    }
];

let currentEvent = null;
let daysRemaining = 0;
let landUsage = 0;

function ecosystemIntroduction() {
    alert("Welcome to the ecosystem simulation! In this virtual environment, we'll observe the interactions between rabbits, foxes, grass, and weeds. Let's see how they co-exist and influence each other's populations.");
}
function checkSignificantChange(org, prevCount) {
    const currentCount = org.count;
    const percentageChange = Math.abs((currentCount - prevCount) / prevCount);

    if (percentageChange > 0.5 && currentCount < 10) {
        alert(`${org.name}s are on the verge of extinction! There are only ${currentCount} left.`);
    } else if (percentageChange > 0.5 && currentCount > prevCount) {
        alert(`${org.name}s are rapidly increasing in number! Ensure that they don't overconsume their food sources.`);
    } else if (percentageChange > 0.5 && currentCount < prevCount) {
        alert(`${org.name}s are rapidly decreasing in number! It might be due to a lack of food or other external factors.`);
    }
}

function checkRandomEvent(ecosystem) {
    if (currentEvent && daysRemaining <= 0) {
        currentEvent.endEffect(ecosystem);
        currentEvent = null;
    }

    const eventChance = 0.01;

    if (!currentEvent && Math.random() < eventChance) {
        currentEvent = events[Math.floor(Math.random() * events.length)];
        daysRemaining = currentEvent.duration;
        currentEvent.effect(ecosystem);
        alert(currentEvent.message);
    }

    if (currentEvent) {
        daysRemaining--;
    }
}

let dayCount = 0;
let chart;
let currentSeason = "Spring";

function changeSeason() {
    const seasons = ["Spring", "Summer", "Fall", "Winter"];
    const idx = (seasons.indexOf(currentSeason) + 1) % seasons.length;
    currentSeason = seasons[idx];

    // Adjusting reproduction rates based on seasons
    ecosystem.forEach(org => {
        if (org.name === "Grass" || org.name === "Weed") {
            switch(currentSeason) {
                case "Spring":
                    org.matingProb *= 1.2; // Increase by 20% in Spring
                    break;
                case "Summer":
                    org.matingProb *= 1.05; // Slight increase in Summer
                    break;
                case "Fall":
                    org.matingProb *= 0.95; // Slight decrease in Fall
                    break;
                case "Winter":
                    org.matingProb *= 0.7; // Decrease by 30% in Winter
                    break;
            }
        }
    });

    alert(`Season has changed to ${currentSeason}`);
}

function checkSeasonChange() {
    if (dayCount % 6 === 0) {
        changeSeason();
    }
}

function simulateDay(ecosystem) {
    // Reset land usage every day
    landUsage = ecosystem.reduce((acc, org) => {
        if (org.name === "Grass" || org.name === "Weed") {
            acc += org.count;
        }
        return acc;
    }, 0);

    checkRandomEvent(ecosystem);

    // Store a copy of previous counts for checking significant changes
    const prevCounts = {};
    ecosystem.forEach(org => {
        prevCounts[org.name] = org.count;
    });

    let shuffledEcosystem = ecosystem.sort(() => Math.random() - 0.5);
    shuffledEcosystem.forEach(org => org.dailyRoutine(ecosystem));

    // Check for significant changes
    ['Fox', 'Rabbit'].forEach(animal => {
        const org = ecosystem.find(o => o.name === animal);
        if (org) {
            checkSignificantChange(org, prevCounts[animal]);
        }
    });
    
    checkSeasonChange();
}


function initializeGraph() {
    const colors = {
        Rabbit: 'blue',
        Fox: 'red',
        Grass: 'green',
        Weed: 'purple',
        Deer: 'brown',
        Coyote: 'gray',
        Bobcat: 'orange',
        Sparrow: 'lightblue',
        Hawk: 'darkred',
        Shrub: 'darkgreen',
        Tree: 'darkbrown',
        Butterfly: 'yellow',
        Beetle: 'darkorange',
        Grasshopper: 'lightgreen',
        Ant: 'black',
        Wildflower: 'pink'
    };
    

    const datasets = [];

    for (let organismName in history) {
        datasets.push({
            label: organismName,
            borderColor: colors[organismName],
            data: [],
            fill: false
        });
    }

    const ctx = document.getElementById('populationChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: datasets
        }
    });
}

function updateUI() {
    ecosystem.forEach(org => {
        document.getElementById(`${org.name}-count`).textContent = org.count;
    });
}

function updateGraph() {
    chart.data.labels.push(dayCount);

    for (let i = 0; i < chart.data.datasets.length; i++) {
        const organismName = chart.data.datasets[i].label;
        chart.data.datasets[i].data.push(history[organismName][dayCount - 1]);
    }

    chart.update();
}

function checkFoodChainBroken() {
    if (ecosystem.some(org => org.name === "Grass" && org.count <= 0)) {
        alert("The grass has gone extinct! Grass is a primary producer and forms the base of the food chain. Its extinction can lead to a collapse of the ecosystem, affecting all other organisms.");
        return true;
    }
    
    if (ecosystem.some(org => org.name === "Rabbit" && org.count <= 0)) {
        alert("Rabbits have gone extinct! As primary consumers, rabbits are crucial for controlling plant populations and serving as prey for predators. Their extinction will have cascading effects on the ecosystem.");
        return true;
    }
    
    if (ecosystem.every(org => (org.name !== "Grass" && org.name !== "Weed") && org.count <= 0)) {
        alert("All animals have died! Without animals, plants might overgrow without check, leading to potential ecological imbalances. The balance between flora and fauna is crucial for a stable ecosystem.");
        return true;
    }
    
    return false;
}



function runSimulationDayByDay() {
    if (!checkFoodChainBroken()) {
        simulateDay(ecosystem);
        dayCount++;

        ecosystem.forEach(org => {
            history[org.name].push(org.count);
        });

        updateUI();
        updateGraph();

        setTimeout(runSimulationDayByDay, 200);
    } else {
        alert(`The food chain is broken on day ${dayCount}!`);
    }
}


initializeGraph();
updateUI();
updateGraph
ecosystemIntroduction();

document.getElementById("startSimulation").addEventListener("click", function() {
    runSimulationDayByDay();
});
