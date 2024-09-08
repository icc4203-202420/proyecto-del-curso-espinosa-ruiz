class ChangeCountryIdNullOnAddresses < ActiveRecord::Migration[6.1]
  def change
    change_column_null :addresses, :country_id, true
  end
end
