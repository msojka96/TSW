// jshint browser: true, esversion: 6, globalstrict: true, devel: true
/* globals io: false */

document.onreadystatechange = () => {
    if (document.readyState === "interactive") {
        const socket = io.connect("http://10.10.4.206:3001");
        let horses,
            judges,
            classes,
            classhorses,
            clickedClass = 0,
            actualhorse = 0,
            startindex = 0,
            actualJudges = 0;

        renderClassTrue = (data) => {
            document.getElementById(
                "actual"
            ).innerHTML += `<div class="element" id="${data._id}">Nr ${
                data.number
            }. ${data.category}</div>`;
        };

        renderClassFalse = (data) => {
            document.getElementById("end").innerHTML += `<div class="element" id="${
                data._id
            }">Nr ${data.number}. ${data.category}</div>`;
        };

        removeClass = (data) => {
            document.getElementById(data).remove();
        };

        editClass = (data) => {
            document.getElementById(data._id).innerHTML = `<div class="element" id="${
                data._id
            }">Nr ${data.number}. ${data.category}</div>`;

            if (clickedClass === data.number) {
                let index = classes.findIndex(item => item._id === data._id);
                document.getElementById("classname").innerHTML = `${index + 1}/${
                    classes.length
                }. ${data.category}`;
            }
        };

        points = (horse) => {
            let aresult = 0;
            horse.result.notes.forEach((note) => {
                if (note.htype !== null) {
                    aresult += parseInt(note.htype);
                }
                if (note.head !== null) {
                    aresult += parseInt(note.head);
                }

                if (note.barrel !== null) {
                    aresult += parseInt(note.barrel);
                }

                if (note.legs !== null) {
                    aresult += parseInt(note.legs);
                }

                if (note.move !== null) {
                    aresult += parseInt(note.move);
                }
            });

            return aresult;
        };

        sorting = () => {
            classhorses.sort((a, b) => {
                let aresult = 0;
                let bresult = 0;

                let ahtype = 0;
                let amresult = 0;
                let bhtype = 0;
                let bmresult = 0;
                let asum = 0;
                let bsum = 0;

                a.result.notes.forEach((note) => {
                    if (note.htype !== null) {
                        aresult += parseInt(note.htype);
                        ahtype += parseInt(note.htype);
                        asum += parseInt(note.htype);
                    }
                    if (note.move !== null) {
                        aresult += parseInt(note.move);
                        amresult += parseInt(note.move);
                        asum += parseInt(note.move);
                    }
                    if (note.barrel !== null) {
                        asum += parseInt(note.barrel);
                    }

                    if (note.legs !== null) {
                        asum += parseInt(note.legs);
                    }

                    if (note.head !== null) {
                        asum += parseInt(note.head);
                    }
                });

                b.result.notes.forEach((note) => {
                    if (note.htype !== null) {
                        bresult += parseInt(note.htype);
                        bhtype += parseInt(note.htype);
                        bsum += parseInt(note.htype);
                    }
                    if (note.move !== null) {
                        bresult += parseInt(note.move);
                        bmresult += parseInt(note.move);
                        bsum += parseInt(note.move);
                    }
                    if (note.barrel !== null) {
                        bsum += parseInt(note.barrel);
                    }

                    if (note.legs !== null) {
                        bsum += parseInt(note.legs);
                    }

                    if (note.head !== null) {
                        bsum += parseInt(note.head);
                    }
                });

                if (asum > bsum) {
                    return bsum - asum;
                }

                if (asum === bsum) {
                    if (aresult === bresult) {
                        if (ahtype === bhtype) {
                            if (amresult === bmresult) {
                                if (bresult !== 0) {
                                    this.arbitrator.push(b._id);
                                }
                                if (aresult !== 0) {
                                    this.arbitrator.push(a._id);
                                }
                                return a.result.arbitrator - b.result.arbitrator;
                            }
                            return bmresult - amresult;
                        }
                        return bhtype - ahtype;
                    }
                    return bresult - aresult;
                }
                return null;
            });


            let temp = [];

            classhorses.forEach((element) => {
                let index = temp.findIndex(el => el._id === element._id);
                if (index === -1) {
                    temp.push(element);
                }
            });
            classhorses = temp;

            podium();
        };

        podium = () => {
            try {
                let index = classes.findIndex(item => item.number === clickedClass);
                let podium = "";
                classhorses.forEach((element, index) => {
                    podium += `<div class="item" id=${element._id}>${index + 1}. ${
                        element.name
                    } - ${points(element)} pkt.</div>`;
                });

                document.getElementById("classname").innerHTML = `${index + 1}/${
                    classes.length
                }. ${classes[index].category} (Nr ${classes[index].number}. )`;

                document.getElementById("podium").innerHTML = podium;

                if (startindex === 0) {
                    actualhorse = classhorses[0];
                    startindex = 1;
                }
                notes();
                Array.from(document.getElementsByClassName("item")).forEach((item) => {
                    item.addEventListener("click", () => {
                        let index1 = classhorses.findIndex(horse => horse._id === item.id);
                        actualhorse = classhorses[index1];
                        horseInfo(classhorses[index1]);
                    });
                });
            }
            catch (e) {}
        };

        horseInfo = (horse) => {
            let index = classhorses.findIndex(item => item._id === actualhorse._id);
            horse = classhorses[index];

            document.getElementById("points").innerHTML = `${points(horse)} pkt.`;
            document.getElementById("horsename").innerHTML = `Nr ${horse.number}. ${
                horse.name
            }`;
            document.getElementById("notes").innerHTML = "";
            index = classes.findIndex(item => item.number === clickedClass);

            actualJudges = [];
            classes[index].committee.forEach((element) => {
                let index2 = judges.findIndex(judge => judge.id === element);
                actualJudges.push(judges[index2]);
            });

            let fillall = "";
            horse.result.notes.forEach((note, index) => {
                let fill = `<div class="${note._id} note">${note.htype}</div>
                <div class="${note._id} note">${note.head}</div>
                <div class="${note._id} note">${note.barrel}</div>
                <div class="${note._id} note">${note.legs}</div>
                <div class="${note._id} note">${note.move}</div>`;

                try {
                    fill += `<div class="judge">${actualJudges[index].judge} (${
                        actualJudges[index].country
                    })</div>`;
                    fillall += `<div class="row">${fill}</div>`;
                }
                catch (e) {}
            });

            document.getElementById("notes").innerHTML = fillall;

            if (horse.result.arbitrator) {
                document.getElementById("notes").innerHTML += `<div class="row">
                    <div id="arbitrator">
                    <div id="name">Rozjemca</div>
                    <div id="result">${horse.result.arbitrator}</div>
                </div>`;
            }
        };

        clickEvents = () => {
            let classeshtml = document.getElementsByClassName("element");

            Array.from(classeshtml).forEach((elem) => {
                elem.addEventListener("click", () => {
                    let index = classes.findIndex(item => item._id === elem.id);

                    classhorses = horses.map((horse) => {
                        if (horse.class === classes[index].number) {
                            return horse;
                        }
                        return 0;
                    });

                    classhorses = classhorses.filter(el => el !== 0);


                    startindex = 0;
                    actualhorse = 0;
                    document.getElementById("classes").style.display = "none";
                    document.getElementById("selected").style.display = "flex";
                    document.getElementById("backbutton").style.display = "flex";
                    document.getElementById("classname").style.display = "flex";
                    clickedClass = classes[index].number;

                    sorting();
                });
            });
        };

        checkClasses = () => {
            classes.forEach((element, index) => {
                classes[index].status = false;
                checkClass(element, index);

                if (classes[index].status) {
                    renderClassTrue(classes[index]);
                }
                else {
                    renderClassFalse(classes[index]);
                }
            });

            clickEvents();
        };

        notes = () => {
            horseInfo(actualhorse);
        };

        checkClass = (element, index) => {
            classes[index].status = false;
            horses.forEach((horse) => {
                if (horse.class === element.number) {
                    horse.result.notes.forEach((note) => {
                        if (
                            note.htype === null
              || note.head === null
              || note.barell === null
              || note.legs === null
              || note.move === null
                        ) {
                            classes[index].status = true;
                        }
                    });
                }
            });
        };

        backClick = () => {
            document.getElementById("backbutton").addEventListener("click", () => {
                document.getElementById("classes").style.display = "flex";
                document.getElementById("selected").style.display = "none";
                document.getElementById("classname").style.display = "none";
                document.getElementById("backbutton").style.display = "none";

                startindex = 0;
                clickedClass = 0;
                clickEvents();
            });
        };

        socket.on("connect", () => {
            socket.emit("getclassesinit");
            backClick();

            socket.on("editclass", (data) => {
                let index = classes.findIndex(item => item._id === data._id);

                classes[index] = data;

                checkClass(classes[index], index);
                classes.sort((a, b) => a.number - b.number);

                classhorses = horses.map((horse) => {
                    if (horse.class === classes[index].number) {
                        return horse;
                    }
                    return 0;
                });

                classhorses = classhorses.filter(el => el !== 0);

                sorting();

                document.getElementById("actual").innerHTML = "";
                document.getElementById("end").innerHTML = "";
                checkClasses();
            });

            socket.on("editnotes", (data) => {
                let index = horses.findIndex(item => item._id === data._id);
                let index1 = classes.findIndex(item => item.number === data.class);
                horses[index] = data;
                let index2 = classhorses.findIndex(item => item._id === data._id);
                classhorses[index2] = data;
                sorting();

                let oldstatus = classes[index1].status;
                checkClass(classes[index1], index1);

                if (oldstatus !== classes[index1].status) {
                    document.getElementById(classes[index1]._id).remove();

                    if (!classes[index1].status) {
                        renderClassFalse(classes[index1]);
                    }
                    else {
                        renderClassTrue(classes[index1]);
                    }
                    clickEvents();
                }
            });

            socket.on("addhorse", (data) => {
                horses.push(data);
                if (clickedClass === data.class) {
                    try {
                        classhorses.push(data);
                        sorting();
                        document.getElementById("actual").innerHTML = "";
                        document.getElementById("end").innerHTML = "";
                        checkClasses();
                    }
                    catch (e) {}
                }
            });

            socket.on("edithorse", (data) => {
                try {
                    let index = horses.findIndex(item => item._id === data._id);
                    let actualclass = horses[index].class;
                    horses[index] = data;
                    if (clickedClass === horses[index].class) {
                        classhorses.push(horses[index]);
                        sorting();
                    }
                    else {
                        index = classhorses.findIndex(item => item._id === data._id);
                        classhorses.splice(index, 1);
                        actualhorse = classhorses[0];
                        sorting();
                    }

                    if (actualclass !== data.class) {
                        let index1 = classes.findIndex(item => item.number === actualclass);
                        let index2 = classes.findIndex(item => item.number === data.class);
                        let oldstatus = classes[index2].status;
                        let oldstatus1 = classes[index1].status;
                        checkClass(classes[index1], index1);
                        checkClass(classes[index2], index2);

                        if (oldstatus !== classes[index2].status) {
                            document.getElementById(classes[index2]._id).remove();
                            if (!classes[index2].status) {
                                renderClassFalse(classes[index2]);
                            }
                            else {
                                renderClassTrue(classes[index2]);
                            }
                        }

                        if (oldstatus1 !== classes[index1].status) {
                            document.getElementById(classes[index1]._id).remove();
                            if (!classes[index1].status) {
                                renderClassFalse(classes[index1]);
                            }
                            else {
                                renderClassTrue(classes[index1]);
                            }
                        }
                    }
                    else {
                        let index3 = classhorses.findIndex(horse => horse._id === data._id);
                        classhorses[index3] = data;
                        sorting();
                    }

                    clickEvents();
                }
                catch (e) {}

                document.getElementById("actual").innerHTML = "";
                document.getElementById("end").innerHTML = "";
                checkClasses();
            });

            socket.on("deletehorse", (data) => {
                let index = horses.findIndex(item => item._id === data);
                let index1 = classes.findIndex(
                    item => item.number === horses[index].class
                );

                if (horses[index].class === clickedClass) {
                    try {
                        let index2 = classhorses.findIndex(item => item._id === data);
                        if (actualhorse._id === classhorses[index2]._id) {
                            startindex = 0;
                        }
                        classhorses.splice(index2, 1);
                        sorting();
                    }
                    catch (e) {}
                }
                horses.splice(index, 1);

                checkClass(classes[index1], index1);

                if (!classes[index1].status) {
                    document.getElementById(classes[index1]._id).remove();
                    renderClassFalse(classes[index1]);

                    clickEvents();
                }
            });

            socket.on("addclass", (data) => {
                classes.push(data);
                classes.sort((a, b) => a.number - b.number);

                let index = classes.findIndex(item => item._id === data._id);
                checkClass(classes[index], index);
                if (classes[index].status) {
                    renderClassTrue(classes[index]);
                }
                else {
                    renderClassFalse(classes[index]);
                }
                clickEvents();
                sorting();
            });

            socket.on("deleteClass", (data) => {
                let index = classes.findIndex(item => item._id === data);
                classes.splice(index, 1);
                classes.sort((a, b) => a.number - b.number);
                removeClass(data);

                document.getElementById("classes").style.display = "flex";
                document.getElementById("selected").style.display = "none";
                document.getElementById("classname").style.display = "none";

                alert("Przepraszamy, klasa została usunięta");
            });
            socket.on("gethorses", async (data) => {
                horses = await data;

                document.getElementById("actual").innerHTML = "";
                document.getElementById("end").innerHTML = "";

                checkClasses();
            });


            socket.on("deletejudge", (data) => {
                let index = judges.findIndex(judge => judge._id === data);
                let index5;
                try {
                    index5 = actualJudges.findIndex(judge => judge._id === data);
                }
                catch (e) {}

                classes.forEach((item, indx) => {
                    let index3 = item.committee.findIndex(
                        elem => elem === judges[index].id
                    );

                    horses.forEach((horse, index2) => {
                        if (horse.class === item.number) {
                            horses[index2].result.notes.splice(index3, 1);
                            let index4 = classhorses.findIndex(hor => hor._id === horse._id);
                            try {
                                classhorses[index4].result.notes.splice(index3, 1);
                            }
                            catch (e) {}
                        }
                    });

                    classes[indx].committee.splice(index3, 1);
                });

                try {
                    actualJudges.splice(index5, 1);
                }
                catch (e) {}
                judges.splice(index, 1);

                sorting();

                document.getElementById("actual").innerHTML = "";
                document.getElementById("end").innerHTML = "";

                checkClasses();
            });

            socket.on("addjudge", (data) => {
                judges.push(data);
            });

            socket.on("editjudge", (data) => {
                let index = judges.findIndex(judge => judge._id === data._id);
                judges[index] = data;

                let index2 = actualJudges.findIndex(judge => judge._id === data._id);
                actualJudges[index2] = data;

                sorting();
            });

            socket.on("getjudges", async (data) => {
                judges = data;
            });

            socket.on("getclasses", (data) => {
                classes = data;
                classes.sort((a, b) => a.number - b.number);

                socket.emit("gethorsesinit");
                socket.emit("getjudgesinit");
            });
        });
    }
};
