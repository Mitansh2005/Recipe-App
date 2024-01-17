// This variables read the html content to be manipulated in javascript

const meals=document.getElementById('meals');
const favouriteContainer=document.getElementById('fav-meals');
const mealPopup=document.getElementById('meal-popup'); 
const mealInfo=document.getElementById('meal-info');
const popupClosebtn=document.getElementById('close-popup');
// Calling the RandomMeal function
RandomMeal();
// This function calls the fetchFavMeals
fetchFavMeals();

// This reads the input in the search bar
const searchTerm=document.getElementById('search-term');
const searchBtn=document.getElementById('search');
const searchAny=[searchBtn,searchTerm];

// This function gets random meals from the database
async function RandomMeal(){
  const resp=await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
  const respData=await resp .json();
  const randomMeal=respData.meals[0];

  // This is a function call for addmeal defined on line Node.43
  addMeal(randomMeal,true);

}

// This function fetches the meal by id from the database
async function getMealById(id){
  const resp=await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
  const respData= await resp.json();
  const meal=respData.meals[0];
  return meal;
}

// This function fetches the meals from database according to data enterned in the search bar
async function getMealBySearch(term){
  const resp=await fetch( "https://www.themealdb.com/api/json/v1/1/search.php?s="+term);
  const respData= await resp.json();
  const meals=respData.meals;
  return meals;
}


// This the function that prints the data on the webpage
function addMeal(mealData,random=false){
  const meal=document.createElement('div');
  meal.classList.add('meal');
  meal.innerHTML=`
  <div class="meal-header" style="margin:auto">
    ${random ?`<span class="random">
    Random Receipe
  </span>`:''}
    <img class="meal_image" src="${mealData.strMealThumb}"alt="${mealData.strMeal}">
  </div>
  <div class="meal-body">
    <h4>${mealData.strMeal}</h4>
    <button class="fav-btn">
    <i class="fas fa-heart"></i>
  </button>

    </div>
  </div>
`;

// This code reads the like button so that we can add it in favourite meals
const btn=meal.querySelector('.fav-btn');

// This a EventListener that tells the code that the like button is clicked and runs a particular code
btn.addEventListener("click", (e) =>{
  if(btn.classList.contains('active')){
    removeMealFromLS(mealData.idMeal);
    btn.classList.remove('active');
    e.stopPropagation()
  }else{
    addMealToLS(mealData.idMeal);
    btn.classList.add('active');
    e.stopPropagation()
    // window.location.reload();
  }

  
  fetchFavMeals();
});
meal.addEventListener("click",()=>{
  showMealInfo(mealData);
  document.body.style.overflow = 'hidden';
})

meals.appendChild(meal);
}

// This stores the favourite meals the local storage so that the data is not lost when the webpage is reloaded
function addMealToLS(mealId){

  // This variable gets the meals from localStorage
  const mealIds=getMealFromLS();

  // This adds the item in localStorage
  localStorage.setItem('mealIds',JSON.stringify([...mealIds,mealId]));
}
//  This function removes meal fromm localStorage
function removeMealFromLS(mealId){
  const mealIds=getMealFromLS();
  localStorage.setItem('mealIds',JSON.stringify(mealIds.filter(id=>id!==mealId)));
}
function getMealFromLS(){
  const mealIds=JSON.parse(localStorage.getItem('mealIds'));
  return mealIds==null ? []:mealIds;
}

// This function just fetches the data from local storage so that addmealfav function can add it in favourite container
async function fetchFavMeals(){
    //clean the container
    favouriteContainer.innerHTML='';
  const mealIds=getMealFromLS();
  const meals=[];
  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    // This function adds the meal in favourites meals
    addMealFav(meal);
  }
}

// This is the function that adds in the favourite container
function addMealFav(mealData){
const favMeal=document.createElement('li');
  favMeal.innerHTML=`
  <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">   
  <span>${mealData.strMeal}</span></li>
  <button class="clear">
  <i class="fas fa-window-close">
  </i>
  </button>
`;


const btn = favMeal.querySelector(".clear");

btn.addEventListener("click", (e) =>{
  removeMealFromLS(mealData.idMeal );
  fetchFavMeals();
  e.stopPropagation()
});

favMeal.addEventListener("click",()=>{
  showMealInfo(mealData);
})
favouriteContainer.appendChild(favMeal );
}

function showMealInfo(mealData){
  mealInfo.innerHTML='';
  const meals=document.createElement('div');
  const ingredients=[]; 
  for(let i=1;i<=20;i++){
    if(mealData["strIngredient"+i]){
    ingredients.push(`${mealData["strIngredient"+i]}-${mealData["strMeasure"+i]}`)
    }
    else{
      break;
    }
    
  }
  meals.innerHTML=`
  <h1>${mealData.strMeal}</h1>
      <img src="${mealData.strMealThumb}"alt="${mealData.strMeal}">

      <p>${mealData.strInstructions}</p>
      <h3>Ingrediants:</h3>
      <ul>
      ${ingredients.map(ing=>`<li>${ing}</li>`).join('')}
        
      </ul>  
  `
  mealInfo.appendChild(meals);
  mealPopup.classList.remove('hidden');
}
const empty=document.getElementById('fav-meals');

searchTerm.addEventListener("keydown",async(e)=>{
if(e.key==="Enter"){
  meals.innerHTML="";
  const search=searchTerm.value;
  const mealsData= await getMealBySearch(search);
  console.log(search);
  if(search==""){
    empty.innerHTML=`<p style="
      font-family:'poppins';
      color:red;
      font-weight:bold;
      font-size:20px;
      top:-20px;
    ">Please enter a receipe</p>`;
  }
  else if(mealsData){
    mealsData.forEach(meal=>{
      addMeal(meal);
      
    });
  }
}
});




popupClosebtn.addEventListener("click",()=>{
  mealPopup.classList.add('hidden');
  document.body.style.overflow = 'auto';
});