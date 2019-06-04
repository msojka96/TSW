const Horse = require("../models/Horse");
const Class = require("../models/Class");
const express = require("express");
const ObjectId = require("mongodb").ObjectID;

const router = express.Router();

const mongoose = require("mongoose");

router.get("/gethorses", (_req, res) => {
    Horse.find({}, (_err, horses) => {
        res.status(200).json(horses);
    });
});

router.post("/add", (req, res) => {
    let { item } = req.body;
    let id = 0;

    let breeder = {
        name: item.breeder.name,
        country: item.breeder.country
    };
    let owner = {
        name: item.owner.name,
        country: item.owner.country
    };

    let newnotes = [];

    let bloodline = {
        father: {
            name: item.bloodline.father.name,
            country: item.bloodline.father.country
        },
        mother: {
            name: item.bloodline.mother.name,
            country: item.bloodline.mother.country
        },
        fathermother: {
            name: item.bloodline.fathermother.name,
            country: item.bloodline.fathermother.country
        }
    };

    Horse.find({}, (err, items) => {
        items.forEach((element) => {
            if (parseInt(element.id) > id) {
                id = parseInt(element.id);
            }
        });
        id += 1;

        Class.findOne({ number: item.class }, (err, item) => {
            item.committee.forEach((element) => {
                newnotes.push({
                    htype: 0,
                    head: 0,
                    barrel: 0,
                    legs: 0,
                    move: 0
                });
            });

            console.log(newnotes);
            let newHorse = new Horse({
                id,
                number: item.number,
                class: item.class,
                name: item.name,
                country: item.country,
                yob: item.yob,
                hair: item.hair,
                sex: item.sex,
                breeder,
                owner,
                bloodline,
                result: {
                    notes: newnotes
                }
            });

            Horse.createHorse(newHorse, (err, _horse) => {
                if (err) throw err;

                res.status(200).json(newHorse);
            });
        });
    });
});


router.post("/deletenote", (req, res) => {
    let { cnumber } = req.body;
    let { judge } = req.body;

    Horse.find({ class: cnumber }, (err, horses) => {
        horses.forEach((horse) => {
            let newnotes = [];
            horse.result.notes.forEach((jud, index) => {
                if (parseInt(index) !== parseInt(judge)) {
                    newnotes.push(jud);
                }
            });

            Horse.updateOne(
                { _id: ObjectId(horse._id) },
                {
                    $set: {
                        result: {
                            notes: newnotes
                        }
                    }
                },
                (err) => {
                    console.log(newnotes);
                    if (err) {
                        res.status(400).send("Błąd przy usuwaniu not");
                    }
                }
            );
        });
    });
    res.status(200).send();
});


router.post("/addnote", (req, res) => {
    let { cnumber } = req.body;

    Horse.find({ class: cnumber }, (err, horses) => {
        horses.forEach((horse) => {
            let newnotes = horse.result.notes;
            newnotes.push({
                htype: 0,
                head: 0,
                barrel: 0,
                legs: 0,
                move: 0
            });

            Horse.updateOne(
                { _id: ObjectId(horse._id) },
                {
                    $set: {
                        result: {
                            notes: newnotes
                        }
                    }
                },
                (err) => {
                    if (err) {
                        res.status(400).send("Błąd przy dodawaniu not");
                    }
                }
            );
        });
    });

    Horse.find({ }, (err, horses) => {
        res.status(200).json(horses);
    });
});

router.post("/edit", (req, res) => {
    let { item } = req.body;
    let newnotes = [];
    let breeder = {
        name: item.breeder.name,
        country: item.breeder.country
    };
    let owner = {
        name: item.owner.name,
        country: item.owner.country
    };

    let bloodline = {
        father: {
            name: item.bloodline.father.name,
            country: item.bloodline.father.country
        },
        mother: {
            name: item.bloodline.mother.name,
            country: item.bloodline.mother.country
        },
        fathermother: {
            name: item.bloodline.fathermother.name,
            country: item.bloodline.fathermother.country
        }
    };

    Class.findOne({ number: item.class }, (err, item2) => {
        Horse.findOne({ _id: ObjectId(item._id) }, (err, horse) => {
            if (horse.class === item.class) {
                newnotes = horse.result.notes;
            }
            else {
                item2.committee.forEach((element) => {
                    newnotes.push({
                        htype: 0,
                        head: 0,
                        barrel: 0,
                        legs: 0,
                        move: 0
                    });
                });
            }
            console.log(newnotes);
            Horse.updateOne(
                { _id: ObjectId(item._id) },
                {
                    $set: {
                        number: item.number,
                        class: item.class,
                        name: item.name,
                        country: item.country,
                        yob: item.yob,
                        hair: item.hair,
                        sex: item.sex,
                        breeder,
                        owner,
                        bloodline,
                        result: {
                            notes: newnotes
                        }
                    }
                },
                (err) => {
                    if (err) {
                        res.status(400).send("Coś poszło nie tak..");
                    }
                    else {
                        Horse.findOne({ _id: ObjectId(item._id) }, (err, horse1) => {
                            res.status(200).json(horse1);
                        });
                    }
                }
            );
        });
    });
});

router.post("/delete/:id", (req, res) => {
    let { id } = req.params;

    Horse.deleteOne({ _id: ObjectId(id) }, (err, horse) => {
        if (err) {
            res.status(400).send("Coś poszło nie tak..");
        }
        else {
            res.status(200).send("OK");
        }
    });
});

router.post("/randomhorses", (req, res) => {
    let { horses } = req.body;

    mongoose.connect("mongodb://localhost:27017/project-horses", {
        useNewUrlParser: true
    });

    const db = mongoose.connection;

    db.dropCollection("horses", (err, result) => {});

    let responsehorses = [];
    let counter = 0;

    horses.forEach((element) => {
        Horse.findOne(
            {
                id: element.id
            },
            (_err, horse) => {
                if (!horse) {
                    let notes = [];
                    element.wynik.noty.forEach((elem) => {
                        notes.push({
                            htype: elem.typ,
                            head: elem.glowa,
                            barrel: elem.kloda,
                            legs: elem.nogi,
                            move: elem.ruch
                        });
                    });
                    let newHorse = new Horse({
                        id: element.id,
                        number: element.numer,
                        class: element.klasa,
                        name: element.nazwa,
                        country: element.kraj,
                        yob: element.rocznik,
                        hair: element.masc,
                        sex: element.plec,
                        breeder: {
                            name: element.hodowca.nazwa,
                            country: element.hodowca.kraj
                        },
                        owner: {
                            name: element.wlasciciel.nazwa,
                            country: element.wlasciciel.kraj
                        },
                        bloodline: {
                            father: {
                                name: element.rodowod.o.nazwa,
                                country: element.rodowod.o.kraj
                            },
                            mother: {
                                name: element.rodowod.m.nazwa,
                                country: element.rodowod.m.kraj
                            },
                            fathermother: {
                                name: element.rodowod.om.nazwa,
                                country: element.rodowod.om.kraj
                            }
                        },
                        result: {
                            notes
                        }
                    });
                    counter += 1;
                    responsehorses.push(newHorse);
                    Horse.createHorse(newHorse, (err, _horse) => {
                        if (err) throw err;
                    });
                    if (counter === horses.length) {
                        res.status(200).json(responsehorses);
                    }
                }
            }
        );
    });
});

module.exports = router;
