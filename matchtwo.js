const helper =
{

    imagesToMatch : () =>
    {
        const images = 
        [
            {
                name: "black",
                url: "./images/black.png"
            },
            {
                name: "blue",
                url: "./images/blue.png"
            },
            {
                name: "green", 
                url: "./images/green.png"
            },
            {
                name: "grey",
                url: "./images/grey.png"
            },
            {
                name: "light_blue",
                url: "./images/light blue.png"
            },
            {
                name: "light_green",
                url: "./images/light green.png",
            },
            {

                name: "pink",
                url: "./images/pink.png",
            },
            {
                name:"red",
                url: "./images/red.png",
            },
            {
                name: "tealish",
                url: "./images/tealish.png",
            },
            {
                name: "blueish", 
                url:"./images/blueish.png"
            }
        ]

        return images;
    }
}

class Table{
    constructor()
    {
        this.deck;
        this.onExamination = [];
    }

    changeDifficulty(difficulty = "easy")
    {
        this.deck = new Deck(difficulty);
        this.deck.drawCards();
    }

    drawTable()
    {
        const playArea = document.getElementById("play-area");
        playArea.innerHTML = "";
        const cards = this.deck.getCards();
        for(let i = 0; i < cards.length; i++)
        {
            const cardContainer = document.createElement("div");
            cardContainer.id = `card-${i}`;
            const length = cards.length;
            if(length === 6)
                cardContainer.classList.add("col-4")
            else if(length === 10)
            {
                if(i === 0)
                {
                    let pad = document.createElement("div");
                    pad.classList.add("col-1")
                    playArea.appendChild(pad);
                }
                if(i === 5)
                {
                    for(let j = 0; j < 2; j++)
                    {
                        let pad = document.createElement("div");
                        pad.classList.add("col-1")
                        playArea.appendChild(pad);
                    }
                }
                cardContainer.classList.add("col-2");
                cardContainer.classList.add("mb-4");
            }
            else if(length === 20)
                cardContainer.classList.add("col-2")

            const image = document.createElement("img");
            image.addEventListener("click", function(){this.tryMatch(i)}.bind(this));
            image.src = cards[i].getImage();
            cardContainer.appendChild(image);
            playArea.appendChild(cardContainer);
        }
    }

    flipCard(card, index)
    {
        card.invertFlip();
        let image = card.getImage();

        const cardContainer = document.getElementById(`card-${index}`);
        cardContainer.querySelector("img").src = image;
    }

    tryMatch(index)
    {
        const card = this.deck.getCards()[index];
        if(card.isMatchFound())
            return;

        if(this.onExamination.indexOf(card) > -1)
            return;
        
        if(this.onExamination.length == 2)
            return;
        
        this.onExamination.push(card);
        this.flipCard(card, index);

        if(this.onExamination.length == 2)
        {
            const first = this.onExamination[0];
            const second = this.onExamination[1];

            if(!first.determineMatch(second))
            {    
                setTimeout(() => {
                    this.flipCard(first, this.deck.getCards().indexOf(first));
                    this.flipCard(second, this.deck.getCards().indexOf(second));
                    this.onExamination = [];
                }, 1000);
            }
            else
            {
                second.determineMatch(first);
                this.onExamination = [];
            }
        }

        this.stats();
    }

    stats()
    {
        let matches = this.deck.totalMatches();
        document.getElementById("matches").innerHTML = `${matches.current} / ${matches.total} Pairs found`;
    }
}

class Deck{
    constructor(difficulty = "easy")
    {
        let difficulties = {"easy": 6, "medium": 10, "hard": 20};
        if(!difficulties[difficulty])
            throw new Error(`Difficulty ${difficulty} not recognized`);
        
        this.cardsToDraw = difficulties[difficulty];
        this.cards = [];
    }

    drawCards()
    {
        let images = helper.imagesToMatch();
        let excludedImages = [];
        for(let i = 0; i < this.cardsToDraw; i += 2)
        {
            let image = this.randomImage(excludedImages);
            excludedImages.push(image);
            let first = new Card(images[image].name, images[image].url)
            let second = new Card(images[image].name, images[image].url)
            this.addCardPair(first, second)
        }

        this.cards = this.shuffleCards(this.cards);
    }

    randomImage(exclude)
    {
        let number = Math.floor(Math.random() * 10);
        if(exclude.includes(number))
            return this.randomImage(exclude);
        
        return number;
    }

    addCardPair(first, second)
    {
        if(!first instanceof Card)
            throw new Error(`Object supplied is not of type Card \n${first}`)
        if(!second instanceof Card)
            throw new Error(`Object supplied is not of type Card \n${second}`)
        
        first.setMatchingCard(second);
        second.setMatchingCard(first);

        this.cards.push(first);
        this.cards.push(second);
    }

    shuffleCards(array)
    {
        //uh... lifted straight out of stack overflow. I need to randomize the order of things!
        //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        let currentIndex = array.length,  randomIndex;

        while (currentIndex != 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
        }

        return array;   
    }

    getCards()
    {
        return this.cards;
    }

    totalMatches()
    {
        let dividedByPair = 2;
        let total = this.cards.length / dividedByPair;
        let current = 0;
        for(let i = 0; i < this.cards.length; i++)
        {
            if(this.cards[i].isMatchFound())
                current += 1;
        }

        current = current / dividedByPair;

        return {total, current};
    }
}

class Card {
    constructor(name = "empty", image = "")
    {
        this.name = name;
        this.image = image;
        this.backImage = "./images/back.png"
        this.isFliped = true;
        this.matchFound = false;
        this.match;
    }

    getName()
    {
        return this.name;
    }

    getImage()
    {
        let image;
        if(this.getFlip())
            image = this.backImage;
        else
            image = this.image;

        return image;
    }

    invertFlip()
    {
        this.isFliped = !this.isFliped;
    }

    getFlip()
    {
        return this.isFliped;
    }

    setMatchingCard(card)
    {
        if(!card instanceof Card)
            throw new Error("Object supplied is not of type Card")
        
        this.match = card;
    }

    determineMatch(card)
    {
        let areMatch = this.areMatch(card);
        if(areMatch)
            this.matchFound = true;

        return areMatch;
    }

    areMatch(card)
    {
        if(!card instanceof Card)
            throw new Error("Object supplied is not of type Card")
        
        return this.match === card;
    }

    isMatchFound()
    {
        return this.matchFound;
    }
}

let table = new Table();