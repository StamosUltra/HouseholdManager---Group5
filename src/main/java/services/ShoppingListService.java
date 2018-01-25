package services;

import auth.Auth;
import auth.AuthType;
import classes.Item;
import classes.ShoppingList;
import classes.User;
import database.ShoppingListDAO;
import database.UserDAO;
import org.apache.commons.lang3.StringEscapeUtils;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

/**
 * <p>ShoppingListService class.</p>
 *
 * @author team5
 */

@Path("household/{id}/shopping_lists")
public class ShoppingListService {

    /**
     * Produces all shopping lists from a given household
     * If the user is an admin the method will return all available shopping lists associated with the household
     * If the user is not admin the method only returns shopping lists associated with the household and the user
     *
     * @param id the house ID
     * @param userId the user ID
     * @return an array of shopping list
     */
    @GET
    @Auth(AuthType.HOUSEHOLD)
    @Path("/user/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    public ShoppingList[] getShoppingLists(@PathParam("id") String id, @PathParam("userId") String userId) {
        int house_id = Integer.parseInt(id);
        int user_id = Integer.parseInt(userId);
        if (UserDAO.isAdmin(house_id, user_id)) return ShoppingListDAO.getShoppingListsAdmin(house_id);
        return ShoppingListDAO.getShoppingListsUser(house_id, user_id);
    }

    /**
     * Gets a specific shopping list given its shopping list ID
     *
     * @param shoppingListId the shopping list ID
     * @return a ShoppingList object
     */
    @GET
    @Auth
    @Path("/{shopping_list_id}")
    @Produces(MediaType.APPLICATION_JSON)
    public ShoppingList getShoppingList(@PathParam("shopping_list_id") String shoppingListId) {
        return ShoppingListDAO.getShoppingList(Integer.parseInt(shoppingListId));
    }

    /**
     * Produces all users associated with a shopping list
     *
     * @param id the house ID
     * @param shoppingListId the shopping list ID
     * @return an array of users
     */
    @GET
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}/users")
    @Produces(MediaType.APPLICATION_JSON)
    public User[] getShoppingListUsers(@PathParam("id") String id, @PathParam("shopping_list_id") String shoppingListId) {
        return ShoppingListDAO.getUsersInShoppingList(Integer.parseInt(shoppingListId));
    }

    /**
     * <p>getItems.</p>
     *
     * @param id a {@link java.lang.String} object.
     * @param shopping_list_id a {@link java.lang.String} object.
     * @return an array of {@link classes.Item} objects.
     */
    @GET
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}/items")
    @Produces(MediaType.APPLICATION_JSON)
    public Item[] getItems(@PathParam("id") String id, @PathParam("shopping_list_id") String shopping_list_id){
        return ShoppingListDAO.getItems(Integer.parseInt(shopping_list_id));
    }

    /**
     * <p>createShoppingList.</p>
     *
     * @param houseId a int.
     * @param shoppingListName a {@link java.lang.String} object.
     * @return a int.
     */
    @POST
    @Auth(AuthType.HOUSEHOLD)
    @Consumes(MediaType.TEXT_PLAIN)
    public int createShoppingList(@PathParam("id") int houseId, String shoppingListName){
        return  ShoppingListDAO.createShoppingList(StringEscapeUtils.escapeHtml4(shoppingListName), houseId);
    }

    /**
     * Deletes a shopping list given its shopping list ID
     *
     * @param houseId the hose ID
     * @param shopping_list_id the shopping list ID
     * @return a boolean.
     */
    @DELETE
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public boolean deleteShoppingList(@PathParam("id") int houseId, @PathParam("shopping_list_id") int shopping_list_id){
        return (ShoppingListDAO.deleteShoppingList(houseId, shopping_list_id) != -1);
    }

    /**
     * <p>addItems.</p>
     *
     * @param shopping_list_id a int.
     * @param itemName a {@link java.lang.String} object.
     * @return a boolean.
     */
    @POST
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}/items")
    @Consumes(MediaType.TEXT_PLAIN)
    public boolean addItems(@PathParam("shopping_list_id") int shopping_list_id, String itemName){
        return (ShoppingListDAO.addItem(StringEscapeUtils.escapeHtml4(itemName), shopping_list_id) != -1);
    }

    /**
     * <p>deleteItem.</p>
     *
     * @param shopping_list_id a int.
     * @param itemId a int.
     * @return a boolean.
     */
    @DELETE
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}/items/{itemId}")
    public boolean deleteItem(@PathParam("shopping_list_id") int shopping_list_id, @PathParam("itemId") int itemId){
        return (ShoppingListDAO.deleteItem(shopping_list_id, itemId) != -1);
    }

    /**
     * Udates users associated with a shopping list
     *
     * @param houseId the house ID
     * @param shopping_list_id the shopping list ID
     * @param userIds an array of user IDs
     */
    @POST
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}/users")
    @Consumes(MediaType.APPLICATION_JSON)
    public void updateUsers(@PathParam("id") int houseId, @PathParam("shopping_list_id") int shopping_list_id, String[] userIds) {
        for (String u : userIds) {
            System.out.println(u);
        }
        ShoppingListDAO.updateUsers(userIds, shopping_list_id);
    }

    /**
     * Updates 'checkedBy' of an Item given its itemId and userId
     * Sets checkedBy = null if user id = 0
     *
     * @param itemId the item ID
     * @param userId the user ID
     * @return true if the database was updated, false if an error occurred
     */
    @POST
    @Auth(AuthType.HOUSEHOLD)
    @Path("/items/{itemId}/user/")
    @Consumes(MediaType.APPLICATION_JSON)
    public boolean updateCheckedBy(@PathParam("itemId") int itemId , int userId) {
        int rs = ShoppingListDAO.updateCheckedBy(userId, itemId);
        System.out.println(userId + " " + itemId);
        return rs >= 0;
    }

    /**
     * Updates a shopping lists 'archived' column in the database
     *
     * @param shoppingListId the shopping list ID
     * @param archived the wanted value of the column
     * @return a boolean.
     */
    @PUT
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}")
    @Consumes(MediaType.TEXT_PLAIN)
    public boolean updateArchived(@PathParam("shopping_list_id") int shoppingListId, String archived) {
        System.out.println("shoppingListId: " + shoppingListId + ". archived = " + archived);
        return (ShoppingListDAO.updateArchived(shoppingListId, Boolean.parseBoolean(archived)) != -1);
    }

    /**
     * Deletes a row in User_Shopping_list
     *
     * @param shoppingListId the shopping list ID
     * @param userId the user ID
     * @return false if an error occurred, true if no errors occurred
     */
    @DELETE
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}/user")
    @Consumes(MediaType.TEXT_PLAIN)
    public boolean deleteUserInShoppingList(@PathParam("shopping_list_id") int shoppingListId, String userId) {
        return (ShoppingListDAO.updateUserInShoppingList(shoppingListId, Integer.parseInt(userId), true) != -1);
    }

    /**
     * Inserts a row in User_Shopping_list
     *
     * @param shoppingListId the shopping list ID
     * @param userId the user ID
     * @return false if an error occurred, true if no errors occurred
     */
    @POST
    @Auth(AuthType.HOUSEHOLD)
    @Path("/{shopping_list_id}/user")
    @Consumes(MediaType.TEXT_PLAIN)
    public boolean insertUserInShoppingList(@PathParam("shopping_list_id") int shoppingListId, String userId) {
        return (ShoppingListDAO.updateUserInShoppingList(shoppingListId, Integer.parseInt(userId) , false) != -1);
    }
}
