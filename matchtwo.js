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
        const cards = this.deck.getCards();
        for(let i = 0; i < cards.length; i++)
        {
            const cardContainer = document.createElement("div");
            cardContainer.id = `card-${i}`;

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
        
        if(this.onExamination.length == 2)
            return;
        
        this.onExamination.push(card);
        this.flipCard(card, index);

        if(this.onExamination.length == 2)
        {
            const first = this.onExamination[0];
            const second = this.onExamination[1];

            if(!first.areMatch(second))
            {    
                setTimeout(() => {
                    this.flipCard(first, this.deck.getCards().indexOf(first));
                    this.flipCard(second, this.deck.getCards().indexOf(second));
                    this.onExamination = [];
                }, 2000);
            }
            else
                this.onExamination = [];
        }
    }
}

class Deck{
    constructor(difficulty = "easy")
    {
        let difficulties = {"easy": 6, "normal": 10, "hard": 20};
        if(!difficulties[difficulty])
            throw new Error(`Difficulty ${difficulty} not recognized`);
        
        this.cardsToDraw = difficulties[difficulty];
        this.cards = [];
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
    }

    randomImage(exclude)
    {
        let number = Math.floor(Math.random() * 10);
        if(exclude.includes(number))
            return this.randomImage(exclude);
        
        return number;
    }

    getCards()
    {
        return this.cards;
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
table.changeDifficulty();
table.drawTable();