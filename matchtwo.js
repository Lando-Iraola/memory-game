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
                url: "./images/'light blue'.png"
            },
            {
                name: "light_green",
                url: "./images/'light green'.png",
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
        this.deck
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
            let cardContainer = `
            <div class="card" id="card-${i}">
                <img src="${cards[i].getImage()}"/>
            </div>`;

            playArea.innerHTML += cardContainer;
        }
    }

    flipCard(index)
    {
        this.deck.getCards()[index].invertFlip();
        let image = this.deck.getCards()[index].getImage();

        document.getElementById(`card-${i}`).src = image;
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
            this.matchFound();

        return areMatch;
    }

    areMatch(card)
    {
        if(!card instanceof Card)
            throw new Error("Object supplied is not of type Card")
        
        return this.match === card;
    }

    matchFound()
    {
        this.matchFound = true;
    }
}