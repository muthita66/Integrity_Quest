import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Vegetable from "../../../../assets/unit2/Level1/vegetable.png";
import Ticket from "../../../../assets/unit2/Level1/ticket.png";
import Bill from "../../../../assets/unit2/Level1/utility-bill.png";
import LuxuryBags from "../../../../assets/unit2/Level1/shopping-bag.png";
import Coffee from "../../../../assets/unit2/Level1/coffee.png";
import Car from "../../../../assets/unit2/Level1/car.png";
import Medicine from "../../../../assets/unit2/Level1/medicine.png";
import SmartPhone from "../../../../assets/unit2/Level1/smartphone.png";
import House from "../../../../assets/unit2/Level1/house.png";
import Shirt from "../../../../assets/unit2/Level1/shirt.png";

const INITIAL_ITEMS = [
    {
        id: 1,
        src: Vegetable,
        alt: "Vegetable",
        name: "Vegetable",
        type: "need",
    },
    {
        id: 2,
        src: Ticket,
        alt: "Ticket",
        name: "Ticket",
        type: "want",
    },
    {
        id: 3,
        src: Bill,
        alt: "Bill",
        name: "Bill",
        type: "need",
    },
    {
        id: 4,
        src: LuxuryBags,
        alt: "LuxuryBags",
        name: "LuxuryBags",
        type: "want",
    },
    {
        id: 5,
        src: Coffee,
        alt: "Coffee",
        name: "Coffee",
        type: "want",
    },
    {
        id: 6,
        src: Car,
        alt: "Car",
        name: "Car",
        type: "need",
    },
    {
        id: 7,
        src: Medicine,
        alt: "Medicine",
        name: "Medicine",
        type: "need",
    },
    {
        id: 8,
        src: SmartPhone,
        alt: "SmartPhone",
        name: "SmartPhone",
        type: "want",
    },
    {
        id: 9,
        src: House,
        alt: "House",
        name: "House",
        type: "need",
    },
    {
        id: 10,
        src: Shirt,
        alt: "Shirt",
        name: "Shirt",
        type: "need",
    },
];

export default function useShoppingGame() {
    const navigate = useNavigate();

    const [poolItems, setPoolItems] = useState(INITIAL_ITEMS);
    const [needsBasket, setNeedsBasket] = useState([]);
    const [wantsBasket, setWantsBasket] = useState([]);

    const removeItemFromZone = (itemId, sourceZone) => {
        if (sourceZone === "pool") {
            setPoolItems((previousItems) =>
                previousItems.filter((item) => item.id !== itemId)
            );
        }

        if (sourceZone === "need") {
            setNeedsBasket((previousItems) =>
                previousItems.filter((item) => item.id !== itemId)
            );
        }

        if (sourceZone === "want") {
            setWantsBasket((previousItems) =>
                previousItems.filter((item) => item.id !== itemId)
            );
        }
    };

    const addItemToZone = (item, targetZone) => {
        if (targetZone === "pool") {
            setPoolItems((previousItems) => [...previousItems, item]);
        }

        if (targetZone === "need") {
            setNeedsBasket((previousItems) => [...previousItems, item]);
        }

        if (targetZone === "want") {
            setWantsBasket((previousItems) => [...previousItems, item]);
        }
    };

    const moveItemBetweenZones = (item, sourceZone, targetZone) => {
        if (!item || !sourceZone || !targetZone) return;
        if (sourceZone === targetZone) return;

        removeItemFromZone(item.id, sourceZone);
        addItemToZone(item, targetZone);
    };

    const checkAnswers = () => {
        const hasWrongInNeeds = needsBasket.some(
            (item) => item.type !== "need"
        );

        const hasWrongInWants = wantsBasket.some(
            (item) => item.type !== "want"
        );

        const hasAllItemsPlaced =
            needsBasket.length + wantsBasket.length === INITIAL_ITEMS.length;

        const pass =
            hasAllItemsPlaced &&
            !hasWrongInNeeds &&
            !hasWrongInWants;

        const needsWithUserType = needsBasket.map(item => ({ ...item, userType: "need" }));
        const wantsWithUserType = wantsBasket.map(item => ({ ...item, userType: "want" }));
        const combinedItems = [...needsWithUserType, ...wantsWithUserType];
        
        const score = combinedItems.filter(item => item.type === item.userType).length;

        navigate("/unit2/level1/result", {
            state: {
                pass,
                items: combinedItems,
                score
            },
        });
    };

    const resetGame = () => {
        setPoolItems(INITIAL_ITEMS);
        setNeedsBasket([]);
        setWantsBasket([]);
    };

    const isAllPlaced = poolItems.length === 0;

    return {
        poolItems,
        needsBasket,
        wantsBasket,
        isAllPlaced,
        moveItemBetweenZones,
        checkAnswers,
        resetGame,
    };
}