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

class Table
{
    constructor()
    {
        this.deck;
        this.onExamination = [];
        this.msToUncoverCardFor = 100;
    }

    changeDifficulty(difficulty = "easy")
    {
        let difficulties = 
        {
            "easy": {quantityOfPairs: 3, msToUncoverCardFor: 300}, 
            "medium": {quantityOfPairs: 5, msToUncoverCardFor: 180}, 
            "hard": {quantityOfPairs: 10, msToUncoverCardFor: 60}
        };
        if(!difficulties[difficulty])
            throw new Error(`Difficulty ${difficulty} not recognized`);

        this.onExamination = [];
        this.deck = new Deck(difficulties[difficulty].quantityOfPairs);
        this.msToUncoverCardFor = difficulties[difficulty].msToUncoverCardFor;
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
            cardContainer.classList.add("card")

            const image = document.createElement("img");
            image.addEventListener("click", function(){this.tryMatch(i)}.bind(this));
            image.src = cards[i].getImage();
            image.draggable = false;
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
                }, this.msToUncoverCardFor);
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

class Deck
{
    constructor(cardPairsToDraw = 6)
    {
        this.cardPairsToDraw = cardPairsToDraw;
        this.cards = [];
    }

    drawCards()
    {
        let images = helper.imagesToMatch();
        let excludedImages = [];
        for(let i = 0; i < this.cardPairsToDraw; i += 1)
        {
            let image = this.randomImage(excludedImages, images.length);
            excludedImages.push(image);
            let first = new Card(images[image].url)
            let second = new Card(images[image].url)
            this.addCardPair(first, second)
        }

        this.cards = this.shuffleCards(this.cards);
    }

    randomImage(exclude, limitedByArrayLength)
    {
        let number = Math.floor(Math.random() * limitedByArrayLength);
        if(exclude.includes(number))
            return this.randomImage(exclude, limitedByArrayLength);
        
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

        while (currentIndex != 0) 
        {
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

class Card 
{
    constructor(image = "")
    {
        this.image = image;
        this.backImage = "./images/back.png"
        this.isFliped = true;
        this.matchFound = false;
        this.match;
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
        let areMatch = this.match === card;
        if(areMatch)
            this.matchFound = true;

        return areMatch;
    }

    isMatchFound()
    {
        return this.matchFound;
    }
}

let table = new Table();