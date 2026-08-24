import { useRef } from "react";

export default function useDragDrop(moveItemBetweenZones) {
    const draggedItemRef = useRef(null);
    const touchActiveItemRef = useRef(null);
    const sourceZoneRef = useRef(null);

    const handleDragStart = (event, item, sourceZone) => {
        draggedItemRef.current = item;
        sourceZoneRef.current = sourceZone;

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
        }
    };

    const handleDrop = (event, targetZone) => {
        event.preventDefault();

        const item = draggedItemRef.current;
        const sourceZone = sourceZoneRef.current;

        if (!item || !sourceZone) {
            clearDesktopDrag();
            return;
        }

        if (sourceZone !== targetZone) {
            moveItemBetweenZones(item, sourceZone, targetZone);
        }

        clearDesktopDrag();
    };

    const handleDragEnd = () => {
        clearDesktopDrag();
    };

    const clearDesktopDrag = () => {
        draggedItemRef.current = null;
        sourceZoneRef.current = null;
    };

    const handleTouchStart = (event, item, sourceZone) => {
        touchActiveItemRef.current = item;
        sourceZoneRef.current = sourceZone;

        const element = event.currentTarget;

        element.style.zIndex = "50";
        element.style.opacity = "0.9";
    };

    const handleTouchMove = (event) => {
        if (!touchActiveItemRef.current) return;

        if (event.cancelable) {
            event.preventDefault();
        }

        const touch = event.touches[0];
        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();

        element.style.position = "fixed";
        element.style.left = `${touch.clientX - rect.width / 2}px`;
        element.style.top = `${touch.clientY - rect.height / 2}px`;
        element.style.margin = "0";
        element.style.pointerEvents = "none";
    };

    const handleTouchEnd = (event) => {
        const item = touchActiveItemRef.current;
        const sourceZone = sourceZoneRef.current;
        const element = event.currentTarget;

        resetTouchElementStyle(element);

        if (!item || !sourceZone) {
            clearTouchDrag();
            return;
        }

        const touch = event.changedTouches[0];

        const poolElement = document.getElementById("zone-pool");
        const needsElement = document.getElementById("zone-need");
        const wantsElement = document.getElementById("zone-want");

        let targetZone = null;

        if (isInside(touch.clientX, touch.clientY, poolElement)) {
            targetZone = "pool";
        } else if (
            isInside(touch.clientX, touch.clientY, needsElement)
        ) {
            targetZone = "need";
        } else if (
            isInside(touch.clientX, touch.clientY, wantsElement)
        ) {
            targetZone = "want";
        }

        if (targetZone && targetZone !== sourceZone) {
            moveItemBetweenZones(item, sourceZone, targetZone);
        }

        clearTouchDrag();
    };

    const handleTouchCancel = (event) => {
        resetTouchElementStyle(event.currentTarget);
        clearTouchDrag();
    };

    const resetTouchElementStyle = (element) => {
        element.style.position = "";
        element.style.left = "";
        element.style.top = "";
        element.style.margin = "";
        element.style.zIndex = "";
        element.style.opacity = "";
        element.style.pointerEvents = "";
    };

    const clearTouchDrag = () => {
        touchActiveItemRef.current = null;
        sourceZoneRef.current = null;
    };

    const isInside = (x, y, element) => {
        if (!element) return false;

        const rect = element.getBoundingClientRect();

        return (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        );
    };

    return {
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleTouchCancel,
    };
}