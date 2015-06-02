class RemoveImageIdFromComment < ActiveRecord::Migration
  def change
    remove_column :comments, :image_id, :string
  end
end
