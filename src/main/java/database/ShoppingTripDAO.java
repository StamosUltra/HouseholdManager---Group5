package database;

import classes.ShoppingTrip;
import classes.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import static java.sql.Types.NULL;

/**
 * <p>ShoppingTripDAO class.</p>
 *
 */
public class ShoppingTripDAO {

    /**
     * <p>getShoppingTrips.</p>
     *
     * @param houseId a int.
     * @return a {@link java.util.List} object.
     */
    public static List<ShoppingTrip> getShoppingTrips(int houseId) {
        String query = "SELECT * FROM Shopping_trip WHERE houseId = ? ORDER BY shopping_tripId DESC;";

        List<ShoppingTrip> shoppingTripList = new ArrayList<>();

        try (DBConnector dbc = new DBConnector();
             Connection conn = dbc.getConn();
             PreparedStatement st = conn.prepareStatement(query)) {

            st.setInt(1, houseId);
            try (ResultSet rs = st.executeQuery()) {

                while (rs.next()) {
                    ShoppingTrip shoppingTrip = new ShoppingTrip();
                    shoppingTrip.setShoppingTripId(rs.getInt("shopping_tripId"));
                    shoppingTrip.setExpence(rs.getDouble("expence"));
                    shoppingTrip.setShoppingDate(rs.getDate("shopping_tripDate").toLocalDate());
                    shoppingTrip.setName(rs.getString("shopping_tripName"));
                    shoppingTrip.setComment(rs.getString("comment"));
                    shoppingTrip.setUserId(rs.getInt("userId"));
                    shoppingTripList.add(shoppingTrip);
                }
            }

            return shoppingTripList;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * <p>createShoppingTrip.</p>
     *
     * @param shoppingTrip a {@link classes.ShoppingTrip} object.
     * @return a boolean.
     */
    public static boolean createShoppingTrip(ShoppingTrip shoppingTrip) {
        String query = "INSERT INTO Shopping_trip (expence, shopping_tripName, shopping_tripDate, " +
                "comment, userId, houseId, shopping_listId) VALUES (?,?,?,?,?,?,?)";


        if (shoppingTrip.getContributors() == null) {
            return false;
        }

        int id = 0;
        try (DBConnector dbc = new DBConnector();
             Connection conn = dbc.getConn();
             PreparedStatement st = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {

            st.setDouble(1, shoppingTrip.getExpence());
            st.setString(2, shoppingTrip.getName());
            Date date = Date.valueOf(shoppingTrip.getShoppingDate());
            st.setDate(3, date);
            st.setString(4, shoppingTrip.getComment());
            st.setInt(5, shoppingTrip.getUserId());
            st.setInt(6, shoppingTrip.getHouseId());
            if (shoppingTrip.getShopping_listId() > 0) {
                st.setInt(7, shoppingTrip.getShopping_listId());
            } else {
                st.setNull(7, NULL);
            }
            st.executeUpdate();

            try (ResultSet resultSet = st.getGeneratedKeys()) {
                while (resultSet.next()) {
                    id = resultSet.getInt(1);
                }

            }

            String query2 = "INSERT INTO User_Shopping_trip (userId, shopping_tripId) VALUES (?,?)";
            for (User user : shoppingTrip.getContributors()) {
                try (PreparedStatement preparedStatement = conn.prepareStatement(query2)) {
                    preparedStatement.setInt(1, user.getUserId());
                    preparedStatement.setInt(2, id);
                    preparedStatement.executeUpdate();
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

        return true;
    }


    /**
     * <p>getShoppingTrip.</p>
     *
     * @param shopping_tripId a int.
     * @return a {@link classes.ShoppingTrip} object.
     */
    public static ShoppingTrip getShoppingTrip(int shopping_tripId) {
        String query = "SELECT p.* FROM Person p, User_Shopping_trip us WHERE p.userId=us.userId AND us.shopping_tripId=?";
        String query2 = "SELECT st.*, p.name FROM Shopping_trip st, Person p WHERE " +
                "shopping_tripId=? AND p.userId = st.userId";
        String query3 = "SELECT name FROM Shopping_list WHERE shopping_listId = ?;";
        List<User> users = new ArrayList<>();
        ShoppingTrip shoppingTrip = new ShoppingTrip();

        try (DBConnector dbConnector = new DBConnector();
             Connection connection = dbConnector.getConn()) {

            try (PreparedStatement ps = connection.prepareStatement(query)) {
                ps.setInt(1, shopping_tripId);

                try (ResultSet resultSet = ps.executeQuery()) {
                    while (resultSet.next()) {
                        User user = new User();
                        user.setUserId(resultSet.getInt("userId"));
                        user.setName(resultSet.getString("name"));
                        user.setEmail(resultSet.getString("email"));
                        user.setTelephone(resultSet.getString("telephone"));
                        users.add(user);
                    }
                }
            }

            try (PreparedStatement ps2 = connection.prepareStatement(query2)) {
                ps2.setInt(1, shopping_tripId);

                try (ResultSet rs = ps2.executeQuery()) {
                    while (rs.next()) {
                        shoppingTrip.setName(rs.getString("shopping_tripName"));
                        shoppingTrip.setExpence(rs.getDouble("expence"));
                        shoppingTrip.setComment(rs.getString("comment"));
                        shoppingTrip.setUserId(rs.getInt("userId"));
                        shoppingTrip.setUserName(rs.getString("p.name"));
                        shoppingTrip.setShoppingDate(rs.getDate("shopping_tripDate").toLocalDate());
                        shoppingTrip.setShopping_listId(rs.getInt("shopping_listId"));
                    }
                    shoppingTrip.setContributors(users);
                }
            }

            if (shoppingTrip.getShopping_listId() != 0) {
                try (PreparedStatement ps3 = connection.prepareStatement(query3)) {
                    ps3.setInt(1, shoppingTrip.getShopping_listId());

                    try (ResultSet rs1 = ps3.executeQuery()) {
                        while (rs1.next()) {
                            shoppingTrip.setShopping_listName(rs1.getString("name"));
                        }
                    }
                }
            }
            shoppingTrip.setExpencePerPerson();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return shoppingTrip;
    }

    /**
     * <p>deleteShoppingTrip.</p>
     *
     * @param shoppingTripId a int.
     */
    public static void deleteShoppingTrip(int shoppingTripId) {
        if (updateDebtValue(shoppingTripId)) {
            String query = "DELETE FROM Shopping_trip WHERE shopping_tripId = ?";

            try (DBConnector dbc = new DBConnector();
                 Connection conn = dbc.getConn();
                 PreparedStatement st = conn.prepareStatement(query)) {

                st.setInt(1, shoppingTripId);

                st.executeUpdate();

            } catch (SQLException e) {
                e.printStackTrace();
            }
        }


    }


    /**
     * This function updates the debt between people if someone deletes a shopping trip.
     *
     * @param shoppingTripId the id of the shoppingtrip
     * @return true if ok, false if failed
     */
    public static boolean updateDebtValue(int shoppingTripId) {
        String query = "SELECT Shopping_trip.expence, User_Shopping_trip.userId as 'user1', User_Shopping_trip.shopping_tripId, Shopping_trip.userId as 'user2'\n" +
                "FROM Shopping_trip\n" +
                "  INNER JOIN User_Shopping_trip ON Shopping_trip.shopping_tripId=User_Shopping_trip.shopping_tripId\n" +
                "WHERE Shopping_trip.shopping_tripId = ? \n" +
                "AND User_Shopping_trip.userId NOT LIKE Shopping_trip.userId;";

        try (DBConnector dbc = new DBConnector();
             Connection conn = dbc.getConn();
             PreparedStatement st = conn.prepareStatement(query)) {

            st.setInt(1, shoppingTripId);

            ResultSet rs = st.executeQuery();

            if (rs.next()) {
                double value = rs.getDouble("expence");
                User mainUser = new User();
                System.out.println("expende: " + value);
                mainUser.setUserId(rs.getInt("user2"));
                ArrayList<User> users = new ArrayList<User>();
                User user1 = new User();
                user1.setUserId(rs.getInt("user1"));
                users.add(user1);
                while (rs.next()) {
                    User user = new User();
                    user.setUserId(rs.getInt("user1"));
                    users.add(user);
                }

                for (int i = 0; i < users.size(); i++) {
                    ArrayList<User> users2 = new ArrayList<>();

                    for(int j = 0; j < users.size(); j++){
                        users2.add(users.get(j));
                    }
                    users2.add(mainUser);
                    System.out.println("bruker nr: " + i);
                    System.out.println("users1 size: " + users.size());
                    System.out.println("users2 size: " + users2.size());

                    FinanceDAO.updateFinance(users.get(i).getUserId(), value, users2);
                }
            }
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
