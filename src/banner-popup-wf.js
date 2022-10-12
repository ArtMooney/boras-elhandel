// functions
setWithExpiry = (key, value, ttl) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage and return null
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};

closePopup = () => {
  setWithExpiry("banner-popup", true, 5000);
  document.getElementById("banner-popup").style.display = "none";
};

// document loaded
document.addEventListener("DOMContentLoaded", () => {
  const isBannerPopup = getWithExpiry("banner-popup");

  if (!isBannerPopup) {
    document.getElementById("banner-popup").style.display = "block";
  } else {
    document.getElementById("banner-popup").style.display = "none";
  }
});
